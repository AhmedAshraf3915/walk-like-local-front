import { useState } from "react";
import { BadgeCheck, FileCheck2, Languages } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import GuideAccountShell from "@/features/guide/components/GuideAccountShell";
import VerificationStep from "@/features/guideVerification/components/VerificationStep";
import AiAssessmentStep from "@/features/guideVerification/components/AiAssessmentStep";
import { useVerificationAssets } from "@/features/guideVerification/hooks/useVerificationAssets";
import { useAiAssessment } from "@/features/guideVerification/hooks/useAiAssessment";
import { LANGUAGE_OPTIONS } from "@/features/guideVerification/constants";

const SUB_TABS = [
  {
    label: "Documents",
    to: "/guide/complete-profile",
    icon: FileCheck2,
    end: true,
  },
  {
    label: "AI language test",
    to: "/guide/complete-profile/language-test",
    icon: Languages,
  },
];

export default function GuideCompleteProfilePage() {
  const { pathname } = useLocation();
  const isLanguageTab = pathname.endsWith("/language-test");
  const [errorMessage, setErrorMessage] = useState("");
  const verification = useVerificationAssets({ setErrorMessage });
  const assessment = useAiAssessment({ setErrorMessage });

  return (
    <GuideAccountShell>
      <nav
        aria-label="Complete guide profile"
        className="mx-auto grid max-w-2xl grid-cols-2 gap-2 rounded-2xl border border-[#d8d7e8] bg-white p-2 shadow-[0_10px_28px_rgba(1,1,56,0.10)]"
      >
        {SUB_TABS.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? "bg-[#07078c] text-white"
                  : "text-[#010138] hover:bg-[#f3f2f8]"
              }`
            }
          >
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </nav>

      {errorMessage ? (
        <p className="mx-auto mt-6 max-w-4xl rounded-xl border border-[#efc2c2] bg-[#fff3f3] px-4 py-3 text-sm text-[#9f2626]">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-8">
        {isLanguageTab ? (
          assessment.aiTestCompleted ? (
            <section className="mx-auto max-w-3xl rounded-3xl border border-[#cce6b8] bg-white px-6 py-14 text-center shadow-[0_12px_38px_rgba(1,1,56,0.09)]">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#eefbdc] text-[#41651f]">
                <BadgeCheck className="h-10 w-10" />
              </span>
              <h1 className="mt-6 text-3xl font-bold">Language test submitted</h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#65638a]">
                Your answers were submitted successfully. Verified languages
                appear on your public guide profile after review.
              </p>
            </section>
          ) : (
            <AiAssessmentStep
              languageOptions={LANGUAGE_OPTIONS}
              questions={assessment.questions}
              aiQuestionIndex={assessment.aiQuestionIndex}
              aiAnswers={assessment.aiAnswers}
              aiVoiceClips={assessment.aiVoiceClips}
              selectedLanguages={assessment.selectedLanguages}
              isAiSessionStarted={assessment.isAiSessionStarted}
              isRecording={assessment.isRecording}
              recordingSeconds={assessment.recordingSeconds}
              remainingSeconds={assessment.remainingSeconds}
              startingAiSession={assessment.startingAiSession}
              aiUploadingAudio={assessment.aiUploadingAudio}
              submittingAiTest={assessment.submittingAiTest}
              formatDuration={assessment.formatDuration}
              onLanguageToggle={assessment.handleLanguageToggle}
              onStartSession={assessment.startSession}
              onTextAnswerChange={assessment.handleTextAnswerChange}
              onStartRecording={assessment.handleStartRecording}
              onStopRecording={assessment.stopRecording}
              onPrevious={assessment.handlePreviousQuestion}
              onNext={() => {
                void assessment.handleNextQuestion();
              }}
              onRestartSession={assessment.resetSession}
            />
          )
        ) : (
          <div>
            <VerificationStep
              loadingStatus={verification.loadingStatus}
              verificationStatus={verification.verificationStatus}
              assets={verification.assets}
              verificationSkips={verification.verificationSkips}
              uploadingField={verification.uploadingField}
              openFilePicker={verification.openFilePicker}
              toggleVerificationSkip={verification.toggleVerificationSkip}
              nationalIdInputRef={verification.nationalIdInputRef}
              licenseInputRef={verification.licenseInputRef}
              profilePhotoInputRef={verification.profilePhotoInputRef}
              introVideoInputRef={verification.introVideoInputRef}
              handleUpload={verification.handleUpload}
            />

            {!["approved", "pending"].includes(
              verification.verificationStatus,
            ) ? (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={
                    !verification.hasAllUploadedAssets ||
                    verification.submittingVerification
                  }
                  onClick={() => {
                    void verification.submitVerification();
                  }}
                  className="h-12 rounded-xl bg-gradient-to-r from-[#010170] to-[#5656A0] px-7 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {verification.submittingVerification
                    ? "Submitting..."
                    : verification.verificationStatus === "rejected"
                      ? "Resubmit documents"
                      : "Submit for verification"}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </GuideAccountShell>
  );
}
