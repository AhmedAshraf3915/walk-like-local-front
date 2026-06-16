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
import { usePaymentMethod } from "@/features/payment/hooks/usePaymentMethod";
import VerificationStep from "@/features/guideVerification/components/VerificationStep";
import AiAssessmentStep from "@/features/guideVerification/components/AiAssessmentStep";
import ProfileStep from "@/features/guideVerification/components/ProfileStep";
import Stepper from "@/features/guideVerification/components/Stepper";
import PaymentMethodPage from "@/features/payment/components/PaymentMethodPage";
import GuideVerificationFooter from "@/features/guideVerification/components/GuideVerificationFooter";

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
  4: {
    title: "Add Payment Method",
    subtitle:
      "Add a card to receive your traveler earnings. You can do this later.",
  },
};

// Returns the label for the primary action button in the footer.
const getContinueLabel = ({
  step,
  submittingVerification,
  submittingProfile,
  isPaymentSaved,
  isPaymentFormOpen,
}) => {
  if (step === 1 && submittingVerification) return "Submitting...";
  if (step === 3 && submittingProfile) return "Saving...";
  if (step === 4 && !isPaymentSaved && isPaymentFormOpen) return "Save card";
  if (step === 4) return "Finish & Explore";
  return "Continue";
};

const GuideVerificationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const verification = useVerificationAssets({ setErrorMessage });
  const aiAssessment = useAiAssessment({ setErrorMessage });
  const guideProfile = useGuideProfile();
  const paymentMethod = usePaymentMethod();

  // ─── Step navigation ────────────────────────────────────────────────────────

  const handleContinue = async () => {
    if (step === 1) {
      if (
        verification.verificationStatus === "none" ||
        verification.verificationStatus === "rejected"
      ) {
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
        await guideProfile.submitProfile({
          selectedLanguages: aiAssessment.selectedLanguages,
        });
      } catch (error) {
        setErrorMessage(error.message ?? "Unable to save profile right now.");
        return;
      }

      setStep(4);
      setErrorMessage("");
      return;
    }

    if (step === 4) {
      if (!paymentMethod.isPaymentSaved && paymentMethod.isPaymentFormOpen) {
        const saveError = await paymentMethod.savePayment();
        if (saveError) {
          setErrorMessage(saveError);
          return;
        }
        setErrorMessage("");
        return;
      }
      navigate("/guide/profile", { replace: true });
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
      setStep(4);
      setErrorMessage("");
      return;
    }

    if (step === 4) {
      navigate("/guide/profile", { replace: true });
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
    isPaymentSaved: paymentMethod.isPaymentSaved,
    isPaymentFormOpen: paymentMethod.isPaymentFormOpen,
  });

  const canSkipFromFooter =
    step === 1 ||
    step === 3 ||
    step === 4 ||
    (step === 2 && !aiAssessment.aiSkipUsed);

  const isContinueDisabled =
    verification.submittingVerification ||
    aiAssessment.startingAiSession ||
    aiAssessment.submittingAiTest ||
    guideProfile.submittingProfile ||
    (step === 1 &&
      (verification.verificationStatus === "none" ||
        verification.verificationStatus === "rejected") &&
      !verification.hasAllUploadedAssets) ||
    (step === 2 && !aiAssessment.aiTestCompleted) ||
    (step === 3 && !guideProfile.isProfileReady);

  // ─── Step content ────────────────────────────────────────────────────────────

  const renderStepHeader = () => {
    if (step === 1 && verification.verificationStatus === "pending") {
      return (
        <div className="text-center ">
          <p className="text-xs font-semibold tracking-[0.28em] text-[#21204a]">
            STEP 1 OF 4
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
          STEP {step} OF 4
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

      case 4:
        return (
          <PaymentMethodPage
            payment={paymentMethod.payment}
            isPaymentFormOpen={paymentMethod.isPaymentFormOpen}
            isPaymentSaved={paymentMethod.isPaymentSaved}
            isSavingPayment={paymentMethod.isSavingPayment}
            paymentError={paymentMethod.paymentError}
            onTogglePaymentForm={paymentMethod.togglePaymentForm}
            onPaymentChange={paymentMethod.setPaymentField}
            onSaveCard={handleContinue}
          />
        );

      default:
        return null;
    }
  };

  // ─── Layout ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-[#f4f3f8] text-[#101041]">
      <header className="border-b border-[#e1e0ef] bg-white shadow-[0_1px_12px_rgba(22,21,67,0.06)]">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <p className="text-[34px] font-semibold tracking-wide">
            Walk like a Local
          </p>
          <button
            type="button"
            className="rounded-full border border-[#c8c7db] bg-white px-5 py-2 text-sm text-[#2a2953] shadow-[0_2px_8px_rgba(20,19,70,0.05)]"
          >
            Joining as a local guide
          </button>
        </div>
      </header>

      <main className="max-w-350 mx-auto pb-40 pt-8 sm:px-6">
        <div className="mx-auto my-11 w-full max-w-[1200px]">
          <Stepper steps={STEPS} currentStep={step} />
        </div>

        {step !== 4 ? renderStepHeader() : null}

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
