import { ArrowLeft, ArrowRight, Mic } from "lucide-react";

const AiAssessmentStep = ({
  languageOptions,
  questions,
  aiQuestionIndex,
  aiAnswers,
  aiVoiceClips,
  selectedLanguages,
  isAiSessionStarted,
  isRecording,
  recordingSeconds,
  aiUploadingAudio,
  submittingAiTest,
  formatDuration,
  onLanguageToggle,
  onStartSession,
  onTextAnswerChange,
  onStartRecording,
  onStopRecording,
  onPrevious,
  onNext,
}) => {
  const currentQuestion = questions[aiQuestionIndex];
  const currentProgress = aiQuestionIndex + 1;
  const isLastQuestion = currentProgress === questions.length;

  if (!isAiSessionStarted) {
    return (
      <section className="rounded-[18px] border border-[#b9b8dc] bg-white p-8">
        <h2 className="text-[38px] font-semibold text-[#111041]">
          Select your spoken language/s.
        </h2>

        <div className="mt-5 min-h-22 rounded-[28px] border border-[#b7b6d8] bg-[#f7f6fd] px-4 py-3">
          <div className="flex flex-wrap gap-3">
            {selectedLanguages.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => onLanguageToggle(language)}
                className="rounded-full bg-[#afadd2] px-6 py-2 text-[18px] text-[#1c1b67]"
              >
                {language}
                {language === "Arabic" ? "" : " x"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {languageOptions.map((language) => {
            const active = selectedLanguages.includes(language);

            return (
              <button
                key={language}
                type="button"
                onClick={() => onLanguageToggle(language)}
                className={`rounded-full border px-8 py-2 text-[16px] ${
                  active
                    ? "border-[#afadd2] bg-[#efeffa] text-[#2b2a63]"
                    : "border-[#b2b1d7] bg-white text-[#55548a]"
                }`}
              >
                {active ? "" : "+ "}
                {language}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={selectedLanguages.length === 0}
            onClick={onStartSession}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#0d0b8b,#5252a4)] px-8 text-lg font-medium text-white disabled:opacity-60"
          >
            Let&apos;s start <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[18px] border border-[#b9b8dc] bg-white p-8">
      <p className="text-center text-[48px] font-medium text-[#15147c]">2:59</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-4 flex-1 rounded-full bg-[#ececf2]">
          <div
            className="h-4 rounded-full bg-[#070798]"
            style={{ width: `${(currentProgress / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-3xl text-[#16157b]">
          {currentProgress}/{questions.length}
        </span>
      </div>

      <div className="mt-7 text-[#0f0f4b]">
        <p className="text-[34px] font-medium">{currentQuestion.prompt}</p>
        {currentQuestion.quote ? (
          <p className="mt-3 text-center text-[30px]">
            &ldquo;{currentQuestion.quote}&rdquo;
          </p>
        ) : null}
      </div>

      {currentQuestion.type === "text" ? (
        <textarea
          value={aiAnswers[currentProgress] ?? ""}
          onChange={(event) =>
            onTextAnswerChange(currentProgress, event.target.value)
          }
          placeholder="Write your answer"
          className="mt-6 h-20 w-full rounded-[16px] border border-[#b8b7dc] px-5 py-4 text-[18px] text-[#19184f] outline-none placeholder:text-[#6f6ea1]"
        />
      ) : (
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4 text-[#3b3a70]">
            <button
              type="button"
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={aiUploadingAudio}
              className="grid h-14 w-14 place-items-center rounded-full bg-[#19189f] text-white disabled:opacity-60"
            >
              <Mic className="h-6 w-6" />
            </button>
            <p className="text-[34px] font-medium">
              {isRecording
                ? `Recording ${formatDuration(recordingSeconds)}`
                : "Tap to talk"}
            </p>
          </div>
          <div className="rounded-[16px] border border-[#b8b7dc] bg-[#fbfbff] px-4 py-3 text-sm text-[#3b3a70]">
            {aiUploadingAudio
              ? "Uploading recording..."
              : aiVoiceClips[currentProgress]?.asset
                ? `Voice answer ready (${formatDuration(aiVoiceClips[currentProgress].duration)}).`
                : "No recording uploaded yet."}
          </div>
          {aiVoiceClips[currentProgress]?.localUrl ? (
            <audio
              controls
              src={aiVoiceClips[currentProgress].localUrl}
              className="w-full"
            />
          ) : null}
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={aiQuestionIndex === 0}
          className="inline-flex items-center gap-2 text-[17px] text-[#1f1e56] disabled:opacity-30"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        <button
          type="button"
          disabled={submittingAiTest || aiUploadingAudio}
          onClick={onNext}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-[linear-gradient(90deg,#0d0b8b,#5252a4)] px-8 text-lg font-medium text-white"
        >
          {isLastQuestion
            ? submittingAiTest
              ? "Submitting..."
              : "Submit"
            : "Next"}
        </button>
      </div>
    </section>
  );
};

export default AiAssessmentStep;
