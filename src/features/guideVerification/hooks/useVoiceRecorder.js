import { useEffect, useRef, useState } from "react";

/**
 * Handles MediaRecorder mechanics: mic access, recording timer, blob creation,
 * and cleanup of media stream and timer on unmount.
 *
 * Call startRecording({ questionNumber, previousClipLocalUrl }) to begin.
 * The previousClipLocalUrl is revoked automatically when the new recording is ready.
 * onRecordingReady({ questionNumber, file, duration, localUrl }) is called on stop.
 */
export const useVoiceRecorder = ({ onRecordingReady, onError }) => {
	const mediaRecorderRef = useRef(null);
	const mediaStreamRef = useRef(null);
	const recordingChunksRef = useRef([]);
	const recordingTimerRef = useRef(null);
	const currentQuestionRef = useRef(null);
	const previousClipUrlRef = useRef(null);
	// Ref tracks actual elapsed seconds; avoids stale-closure issue in onstop callback.
	const recordingSecondsRef = useRef(0);

	const [isRecording, setIsRecording] = useState(false);
	const [recordingSeconds, setRecordingSeconds] = useState(0);

	useEffect(() => {
		return () => {
			if (recordingTimerRef.current) {
				window.clearInterval(recordingTimerRef.current);
			}

			if (
				mediaRecorderRef.current &&
				mediaRecorderRef.current.state !== "inactive"
			) {
				mediaRecorderRef.current.stop();
			}

			mediaStreamRef.current?.getTracks()?.forEach((track) => track.stop());
		};
	}, []);

	const formatDuration = (seconds) => {
		const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
		const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
		return `${mins}:${secs}`;
	};

	const startRecording = async ({ questionNumber, previousClipLocalUrl }) => {
		try {
			if (!navigator.mediaDevices?.getUserMedia) {
				onError("Recording is not supported in this browser.");
				return;
			}

			currentQuestionRef.current = questionNumber;
			previousClipUrlRef.current = previousClipLocalUrl ?? null;
			recordingSecondsRef.current = 0;

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaStreamRef.current = stream;

			const recorder = new MediaRecorder(stream);
			mediaRecorderRef.current = recorder;
			recordingChunksRef.current = [];
			setRecordingSeconds(0);

			recorder.ondataavailable = (event) => {
				if (event.data && event.data.size > 0) {
					recordingChunksRef.current.push(event.data);
				}
			};

			recorder.onstop = () => {
				if (recordingTimerRef.current) {
					window.clearInterval(recordingTimerRef.current);
					recordingTimerRef.current = null;
				}

				const chunks = recordingChunksRef.current;

				if (!chunks.length) {
					setIsRecording(false);
					return;
				}

				const qNum = currentQuestionRef.current;
				const prevUrl = previousClipUrlRef.current;
				const duration = recordingSecondsRef.current;
				const mimeType = recorder.mimeType || "audio/webm";
				const extension = mimeType.includes("mp4") ? "m4a" : "webm";

				const blob = new Blob(chunks, { type: mimeType });
				const file = new File([blob], `ai-test-q${qNum}.${extension}`, {
					type: mimeType,
				});

				if (prevUrl) {
					URL.revokeObjectURL(prevUrl);
				}

				const localUrl = URL.createObjectURL(blob);

				mediaStreamRef.current?.getTracks()?.forEach((track) => track.stop());
				mediaStreamRef.current = null;
				setIsRecording(false);
				setRecordingSeconds(0);

				onRecordingReady({ questionNumber: qNum, file, duration, localUrl });
			};

			recorder.start();
			setIsRecording(true);
			recordingTimerRef.current = window.setInterval(() => {
				recordingSecondsRef.current += 1;
				setRecordingSeconds((current) => current + 1);
			}, 1000);
		} catch (error) {
			onError(error.message ?? "Unable to access microphone.");
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current?.state === "recording") {
			mediaRecorderRef.current.stop();
		}
	};

	return {
		isRecording,
		recordingSeconds,
		startRecording,
		stopRecording,
		formatDuration,
	};
};
