import { useEffect, useRef, useState } from "react";
import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";
import { AI_TEST_QUESTIONS } from "@/features/guideVerification/constants";
import { useVoiceRecorder } from "@/features/guideVerification/hooks/useVoiceRecorder";

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
	const [aiQuestionIndex, setAiQuestionIndex] = useState(0);
	const [aiAnswers, setAiAnswers] = useState({});
	const [aiVoiceClips, setAiVoiceClips] = useState({});
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

	const startSession = () => {
		setIsAiSessionStarted(true);
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
		const responses = AI_TEST_QUESTIONS.map((question, index) => {
			const questionNumber = index + 1;

			if (question.type === "voice") {
				const clip = aiVoiceClips[questionNumber];
				return {
					questionNumber,
					type: "voice",
					prompt: question.prompt,
					recording: clip?.asset ?? null,
					durationSeconds: clip?.duration ?? 0,
				};
			}

			return {
				questionNumber,
				type: "text",
				prompt: question.prompt,
				answer: aiAnswers[questionNumber] ?? "",
			};
		});

		setSubmittingAiTest(true);
		setErrorMessage("");

		try {
			await guideVerificationApi.submitAiLanguageTest({
				languages: selectedLanguages,
				responses,
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
		aiQuestionIndex,
		aiAnswers,
		aiVoiceClips,
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
