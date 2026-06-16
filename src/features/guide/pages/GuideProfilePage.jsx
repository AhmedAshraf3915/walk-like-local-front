import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "@/contexts/useAuth";
import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";

const LANGUAGE_OPTIONS = [
  { label: "Arabic", value: "ar" },
  { label: "English", value: "en" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
];

const INTEREST_OPTIONS = [
  "History",
  "Food",
  "Photography",
  "Adventure",
  "Culture",
  "Markets",
  "Architecture",
  "Nature",
];

const normalizeLanguages = (languages) => {
  if (!Array.isArray(languages)) {
    return [];
  }

  return languages
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.toLowerCase();
      }

      if (entry && typeof entry === "object") {
        return String(entry.code ?? entry.value ?? "").toLowerCase();
      }

      return "";
    })
    .filter(Boolean);
};

const GuideProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    bio: user?.bio ?? "",
    yearsOfExperience: user?.experience?.year ?? "",
    interests: Array.isArray(user?.interests) ? user.interests : [],
    languages: normalizeLanguages(user?.languages),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fullName = useMemo(() => user?.fullName ?? "Guide", [user?.fullName]);

  const toggleInterest = (interest) => {
    setForm((current) => {
      const exists = current.interests.includes(interest);
      return {
        ...current,
        interests: exists
          ? current.interests.filter((item) => item !== interest)
          : [...current.interests, interest],
      };
    });
  };

  const toggleLanguage = (languageCode) => {
    setForm((current) => {
      const exists = current.languages.includes(languageCode);
      return {
        ...current,
        languages: exists
          ? current.languages.filter((code) => code !== languageCode)
          : [...current.languages, languageCode],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (form.languages.length > 0) {
        await guideVerificationApi.updateGuideLanguages({
          languages: form.languages,
        });
      }

      const payload = {};

      if (form.bio.trim()) {
        payload.bio = form.bio.trim();
      }

      if (form.interests.length > 0) {
        payload.interests = form.interests;
      }

      if (String(form.yearsOfExperience).trim()) {
        payload.experience = { year: String(form.yearsOfExperience).trim() };
      }

      if (Object.keys(payload).length > 0) {
        await guideVerificationApi.completeGuideProfile(payload);
      }

      updateUser({
        bio: payload.bio ?? user?.bio,
        interests: payload.interests ?? user?.interests,
        experience: payload.experience ?? user?.experience,
        languages: form.languages,
      });

      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(error?.message ?? "Unable to update profile right now.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4fb] text-[#17164b]">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-[#d9d8ec] bg-white p-6 shadow-[0_18px_60px_rgba(30,28,79,0.08)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b79a8]">
                Guide Profile
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#100f45] sm:text-4xl">
                {fullName}
              </h1>
              <p className="mt-2 text-[#5d5b84]">
                Keep your public profile fresh so travelers can trust and book
                faster.
              </p>
            </div>

            <Link
              to="/guide/tours/new"
              className="rounded-full bg-[#1d1a7d] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(29,26,125,0.28)] transition hover:bg-[#17146a]"
            >
              Create New Tour
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-7">
            <div>
              <label className="block text-sm font-semibold text-[#23225e]">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Tell travelers about your story and how you guide people through Egypt."
                className="mt-2 w-full rounded-2xl border border-[#d2d1e8] bg-[#fcfcff] px-4 py-3 text-sm text-[#1f1e5a] outline-none ring-[#2b2894] transition focus:ring-2"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-[#23225e]">
                  Years Of Experience
                </label>
                <input
                  value={form.yearsOfExperience}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      yearsOfExperience: event.target.value,
                    }))
                  }
                  placeholder="e.g. 5+ years"
                  className="mt-2 w-full rounded-xl border border-[#d2d1e8] bg-[#fcfcff] px-4 py-2.5 text-sm text-[#1f1e5a] outline-none ring-[#2b2894] transition focus:ring-2"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#23225e]">Languages</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((language) => {
                  const selected = form.languages.includes(language.value);

                  return (
                    <button
                      key={language.value}
                      type="button"
                      onClick={() => toggleLanguage(language.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        selected
                          ? "border-[#1f1c83] bg-[#1f1c83] text-white"
                          : "border-[#cbc9e4] bg-white text-[#403e6b]"
                      }`}
                    >
                      {language.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#23225e]">Interests</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const selected = form.interests.includes(interest);

                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        selected
                          ? "border-[#1f1c83] bg-[#edeefe] text-[#1c1a72]"
                          : "border-[#cbc9e4] bg-white text-[#403e6b]"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-xl border border-[#efc2c2] bg-[#fff2f2] px-4 py-2 text-sm text-[#a12121]">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="rounded-xl border border-[#bedfb8] bg-[#eefce9] px-4 py-2 text-sm text-[#1f6a21]">
                {successMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-[#151270] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(21,18,112,0.3)] transition hover:bg-[#110e61] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuideProfilePage;
