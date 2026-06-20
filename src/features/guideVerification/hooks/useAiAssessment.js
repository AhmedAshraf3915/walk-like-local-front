import { useEffect, useRef, useState } from "react";
import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";
import { AI_TEST_QUESTIONS } from "@/features/guideVerification/constants";
import { useVoiceRecorder } from "@/features/guideVerification/hooks/useVoiceRecorder";

const LANGUAGE_TO_CODE = {
	Arabic: "ar",
	English: "en",
	German: "de",
	Italian: "it",
	Spanish: "es",
	French: "fr",
};

const SUPPORTED_LANGUAGE_CODES = new Set(Object.values(LANGUAGE_TO_CODE));

const toLanguageCode = (language) => {
	if (typeof language !== "string") {
		return "";
	}

	const trimmedLanguage = language.trim();
	const lowerLanguage = trimmedLanguage.toLowerCase();

	if (SUPPORTED_LANGUAGE_CODES.has(lowerLanguage)) {
		return lowerLanguage;
	}

	return LANGUAGE_TO_CODE[trimmedLanguage] ?? "";
};

const extractSessionId = (payload) =>
	payload?.sessionId ??
	payload?.session?.id ??
	payload?.session?._id ??
	payload?.id ??
	"";

/**
 * Manages the full AI language-test flow:
 * language selection, question navigation, text answers, voice recordings,
 * audio upload, test submission, and skip tracking.
 *
 * Voice recording is delegated to useVoiceRecorder internally.
 */
export const useAiAssessment = ({ setErrorMessage }) => {
	const [selectedLanguages, setSelectedLanguages] = useState(["Arabic", "English"]);
	const [isAiSessionStarted, setIsAiSessionStarted] = useState(false);
	const [activeSessionId, setActiveSessionId] = useState("");
	const [aiQuestionIndex, setAiQuestionIndex] = useState(0);
	const [aiAnswers, setAiAnswers] = useState({});
	const [aiVoiceClips, setAiVoiceClips] = useState({});
	const [startingAiSession, setStartingAiSession] = useState(false);
	const [aiUploadingAudio, setAiUploadingAudio] = useState(false);
	const [submittingAiTest, setSubmittingAiTest] = useState(false);
	const [aiTestCompleted, setAiTestCompleted] = useState(false);
	const [aiSkipUsed, setAiSkipUsed] = useState(false);

	// Ref keeps latest clips accessible in the unmount cleanup without needing deps.
	const aiVoiceClipsRef = useRef(aiVoiceClips);

	useEffect(() => {
		aiVoiceClipsRef.current = aiVoiceClips;
	}, [aiVoiceClips]);

	useEffect(() => {
		return () => {
			Object.values(aiVoiceClipsRef.current).forEach((clip) => {
				if (clip?.localUrl) {
					URL.revokeObjectURL(clip.localUrl);
				}
			});
		};
	}, []);

	// Called by useVoiceRecorder when a recording blob is ready.
	const handleRecordingReady = async ({ questionNumber, file, duration, localUrl }) => {
		setAiUploadingAudio(true);
		try {
			const uploadedAsset = await guideVerificationApi.uploadAudio(file);
			setAiVoiceClips((current) => ({
				...current,
				[questionNumber]: { asset: uploadedAsset, localUrl, duration },
			}));
		} catch (error) {
			URL.revokeObjectURL(localUrl);
			setErrorMessage(error.message ?? "Unable to upload recording.");
		} finally {
			setAiUploadingAudio(false);
		}
	};

	const recorder = useVoiceRecorder({
		onRecordingReady: handleRecordingReady,
		onError: (msg) => setErrorMessage(msg),
	});

	const handleLanguageToggle = (language) => {
		setSelectedLanguages((currentLanguages) => {
			if (language === "Arabic" && currentLanguages.includes("Arabic")) {
				return currentLanguages;
			}
			if (currentLanguages.includes(language)) {
				return currentLanguages.filter((item) => item !== language);
			}
			return [...currentLanguages, language];
		});
	};

	const startSession = async () => {
		const languageCodes = [
			...new Set(
				selectedLanguages
					.map(toLanguageCode)
					.filter((value) => Boolean(value)),
			),
		];

		if (languageCodes.length === 0) {
			setErrorMessage("Select at least one supported language to start the test.");
			return;
		}

		const preferredLanguage = languageCodes.find((code) => code !== "ar") || languageCodes[0] || "en";

		setStartingAiSession(true);
		setErrorMessage("");

		try {
			// The language-test API only accepts languages already stored on the
			// guide profile, so persist the selection before checking/starting it.
			await guideVerificationApi.updateGuideLanguages({ languages: languageCodes });
			await guideVerificationApi.getLanguageTestStatus(languageCodes);
			const startResponse = await guideVerificationApi.startLanguageTest({
				language: preferredLanguage,
			});
			const nextSessionId = extractSessionId(startResponse);

			if (!nextSessionId) {
				throw new Error("Language test session did not return a session ID.");
			}

			setActiveSessionId(nextSessionId);
			setIsAiSessionStarted(true);
		} catch (error) {
			setErrorMessage(error.message ?? "Unable to start language test.");
		} finally {
			setStartingAiSession(false);
		}
	};

	const handleTextAnswerChange = (questionNumber, value) => {
		setAiAnswers((current) => ({ ...current, [questionNumber]: value }));
	};

	const handleStartRecording = () => {
		const questionNumber = aiQuestionIndex + 1;
		void recorder.startRecording({
			questionNumber,
			previousClipLocalUrl: aiVoiceClips[questionNumber]?.localUrl,
		});
	};

	const handlePreviousQuestion = () => {
		setAiQuestionIndex((current) => Math.max(0, current - 1));
	};

	const submitAiAssessment = async () => {
		if (!activeSessionId) {
			setErrorMessage("Language test session is missing. Please restart the test.");
			return;
		}

		const responses = AI_TEST_QUESTIONS.map((question, index) => {
			const questionNumber = index + 1;
			const questionId = `q${questionNumber}`;

			if (question.type === "voice") {
				const clip = aiVoiceClips[questionNumber];
				return {
					questionId,
					audioUrl: clip?.asset?.secureUrl ?? "",
				};
			}

			return {
				questionId,
				answer: aiAnswers[questionNumber] ?? "",
			};
		});

		setSubmittingAiTest(true);
		setErrorMessage("");

		try {
			await guideVerificationApi.submitLanguageTest(activeSessionId, {
				answers: responses,
			});
			setAiTestCompleted(true);
		} catch (error) {
			setErrorMessage(error.message ?? "Unable to submit AI language test.");
		} finally {
			setSubmittingAiTest(false);
		}
	};

	const handleNextQuestion = async () => {
		const currentQuestion = AI_TEST_QUESTIONS[aiQuestionIndex];
		const currentProgress = aiQuestionIndex + 1;
		const isLastQuestion = currentProgress === AI_TEST_QUESTIONS.length;

		if (currentQuestion.type === "text") {
			if (!String(aiAnswers[currentProgress] ?? "").trim()) {
				setErrorMessage("Please answer the current question before continuing.");
				return;
			}
		} else if (!aiVoiceClips[currentProgress]?.asset) {
			setErrorMessage("Please record and upload your voice answer before continuing.");
			return;
		}

		setErrorMessage("");

		if (isLastQuestion) {
			await submitAiAssessment();
			return;
		}

		setAiQuestionIndex((current) => current + 1);
	};

	const markSkipUsed = () => {
		setAiSkipUsed(true);
		setAiTestCompleted(true);
	};

	return {
		selectedLanguages,
		isAiSessionStarted,
		activeSessionId,
		aiQuestionIndex,
		aiAnswers,
		aiVoiceClips,
		startingAiSession,
		aiUploadingAudio,
		submittingAiTest,
		aiTestCompleted,
		aiSkipUsed,
		// Recording state forwarded from useVoiceRecorder
		isRecording: recorder.isRecording,
		recordingSeconds: recorder.recordingSeconds,
		formatDuration: recorder.formatDuration,
		// Handlers
		handleLanguageToggle,
		startSession,
		handleTextAnswerChange,
		handleStartRecording,
		stopRecording: recorder.stopRecording,
		handlePreviousQuestion,
		handleNextQuestion,
		markSkipUsed,
	};
};
