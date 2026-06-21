import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  STEPS,
  EXPERIENCE_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  AI_TEST_QUESTIONS,
} from "@/features/guideVerification/constants";
import { useVerificationAssets } from "@/features/guideVerification/hooks/useVerificationAssets";
import { useAiAssessment } from "@/features/guideVerification/hooks/useAiAssessment";
import { useGuideProfile } from "@/features/guideVerification/hooks/useGuideProfile";
import useAuth from "@/contexts/useAuth";
import VerificationStep from "@/features/guideVerification/components/VerificationStep";
import AiAssessmentStep from "@/features/guideVerification/components/AiAssessmentStep";
import ProfileStep from "@/features/guideVerification/components/ProfileStep";
import Stepper from "@/features/guideVerification/components/Stepper";
import GuideVerificationFooter from "@/features/guideVerification/components/GuideVerificationFooter";
import GuideNavbar from "@/components/home/GuideNavbar.jsx";

// Heading text shown above the step content area.
const STEP_HEADINGS = {
  1: {
    title: "Apply as a Local Guide",
    subtitle:
      "Verify your identity and credentials to start guiding travelers across Egypt.",
  },
  2: {
    title: "AI Language Assessment",
    subtitle:
      "A quick 3-minute conversational test to verify fluency in the languages you teach travelers in.",
  },
  3: {
    title: "Complete Your Public Profile",
    subtitle: "This is what travelers see when they browse local guides.",
  },
};

// Returns the label for the primary action button in the footer.
const getContinueLabel = ({
  step,
  submittingVerification,
  submittingProfile,
}) => {
  if (step === 1 && submittingVerification) return "Submitting...";
  if (step === 3 && submittingProfile) return "Saving...";
  if (step === 3) return "Finish & Explore";
  return "Continue";
};

const GuideVerificationPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const verification = useVerificationAssets({ setErrorMessage });
  const aiAssessment = useAiAssessment({ setErrorMessage });
  const guideProfile = useGuideProfile();

  // ─── Step navigation ────────────────────────────────────────────────────────

  const handleContinue = async () => {
    if (step === 1) {
      if (
        verification.verificationStatus === "none" ||
        verification.verificationStatus === "rejected"
      ) {
        if (verification.hasSkippedRequiredAssets) {
          setStep(2);
          setErrorMessage("");
          return;
        }

        await verification.submitVerification();
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!aiAssessment.aiTestCompleted) {
        setErrorMessage(
          "Complete the language test or use your one-time skip.",
        );
        return;
      }
      setStep(3);
      setErrorMessage("");
      return;
    }

    if (step === 3) {
      if (!guideProfile.isProfileReady) {
        setErrorMessage("Complete or skip each profile section to continue.");
        return;
      }

      try {
        const savedProfile = await guideProfile.submitProfile({
          selectedLanguages: aiAssessment.selectedLanguages,
        });

        if (savedProfile) {
          updateUser(savedProfile);
        }
      } catch (error) {
        setErrorMessage(error.message ?? "Unable to save profile right now.");
        return;
      }

      navigate("/guide", { replace: true });
    }
  };

  const handleBack = () => {
    if (step === 1) return;
    setStep((current) => Math.max(1, current - 1));
  };

  const handleSkipForNow = () => {
    if (step === 1) {
      setStep(2);
      setErrorMessage("");
      return;
    }

    if (step === 3) {
      navigate("/guide", { replace: true });
      return;
    }

    if (step === 2 && !aiAssessment.aiSkipUsed) {
      aiAssessment.markSkipUsed();
      setStep(3);
      setErrorMessage("");
    }
  };

  // ─── Derived footer state ────────────────────────────────────────────────────

  const continueLabel = getContinueLabel({
    step,
    submittingVerification: verification.submittingVerification,
    submittingProfile: guideProfile.submittingProfile,
  });

  const canSkipFromFooter =
    step === 1 ||
    step === 3 ||
    (step === 2 && !aiAssessment.aiSkipUsed);

  const isContinueDisabled =
    verification.submittingVerification ||
    aiAssessment.startingAiSession ||
    aiAssessment.submittingAiTest ||
    guideProfile.submittingProfile ||
    (step === 1 &&
      (verification.verificationStatus === "none" ||
        verification.verificationStatus === "rejected") &&
      !verification.hasAllRequiredAssets) ||
    (step === 2 && !aiAssessment.aiTestCompleted) ||
    (step === 3 && !guideProfile.isProfileReady);

  // ─── Step content ────────────────────────────────────────────────────────────

  const renderStepHeader = () => {
    if (step === 1 && verification.verificationStatus === "pending") {
      return (
        <div className="text-center ">
          <p className="text-xs font-semibold tracking-[0.28em] text-[#21204a]">
            STEP 1 OF {STEPS.length}
          </p>
          <h1 className="mt-3 text-[42px] font-bold leading-tight text-[#0d0c3f]">
            Waiting for Approval
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-[20px] leading-8 text-[#35345d]">
            Our team is reviewing your documents to verify your local guide
            status.
          </p>
        </div>
      );
    }

    const heading = STEP_HEADINGS[step];

    return (
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.28em] text-[#21204a]">
          STEP {step} OF {STEPS.length}
        </p>
        <h1 className="mt-3 text-[52px] font-bold leading-tight text-[#0d0c3f]">
          {heading.title}
        </h1>
        <p className="mx-auto mt-3 max-w-4xl text-[20px] leading-8 text-[#35345d]">
          {heading.subtitle}
        </p>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
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
        );

      case 2:
        return (
          <AiAssessmentStep
            languageOptions={LANGUAGE_OPTIONS}
            questions={AI_TEST_QUESTIONS}
            aiQuestionIndex={aiAssessment.aiQuestionIndex}
            aiAnswers={aiAssessment.aiAnswers}
            aiVoiceClips={aiAssessment.aiVoiceClips}
            selectedLanguages={aiAssessment.selectedLanguages}
            isAiSessionStarted={aiAssessment.isAiSessionStarted}
            isRecording={aiAssessment.isRecording}
            recordingSeconds={aiAssessment.recordingSeconds}
            startingAiSession={aiAssessment.startingAiSession}
            aiUploadingAudio={aiAssessment.aiUploadingAudio}
            submittingAiTest={aiAssessment.submittingAiTest}
            formatDuration={aiAssessment.formatDuration}
            onLanguageToggle={aiAssessment.handleLanguageToggle}
            onStartSession={aiAssessment.startSession}
            onTextAnswerChange={aiAssessment.handleTextAnswerChange}
            onStartRecording={aiAssessment.handleStartRecording}
            onStopRecording={aiAssessment.stopRecording}
            onPrevious={aiAssessment.handlePreviousQuestion}
            onNext={() => {
              void aiAssessment.handleNextQuestion();
            }}
          />
        );

      case 3:
        return (
          <ProfileStep
            profile={guideProfile.profile}
            profileSkips={guideProfile.profileSkips}
            experienceOptions={EXPERIENCE_OPTIONS}
            interestOptions={INTEREST_OPTIONS}
            onBioChange={guideProfile.setBio}
            onExperienceChange={guideProfile.setExperience}
            onToggleProfileSkip={guideProfile.toggleProfileSkip}
            onToggleInterest={guideProfile.toggleInterest}
          />
        );

      default:
        return null;
    }
  };

  // ─── Layout ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-[#f4f3f8] text-[#101041]">
      <GuideNavbar
        verified={verification.verificationStatus === "approved"}
        profilePhoto={verification.assets.profilePhoto}
      />

      <main className="max-w-350 mx-auto pb-40 pt-8 sm:px-6">
        <div className="mx-auto my-11 w-full max-w-[1200px]">
          <Stepper steps={STEPS} currentStep={step} />
        </div>

        {renderStepHeader()}

        {errorMessage ? (
          <div className="mx-auto mt-7 max-w-300 rounded-xl border border-[#eab2b2] bg-[#fff3f3] px-5 py-3 text-[#9f2626]">
            {errorMessage}
          </div>
        ) : null}

        <div className="mx-auto mt-10 max-w-[1200px]">
          {renderCurrentStep()}
        </div>
      </main>

      <GuideVerificationFooter
        step={step}
        continueLabel={continueLabel}
        isContinueDisabled={isContinueDisabled}
        canSkipFromFooter={canSkipFromFooter}
        onBack={handleBack}
        onContinue={handleContinue}
        onSkip={handleSkipForNow}
      />
    </div>
  );
};

export default GuideVerificationPage;
