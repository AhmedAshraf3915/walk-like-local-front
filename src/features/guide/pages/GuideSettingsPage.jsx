import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Languages,
  MapPin,
  Save,
  UserRound,
} from "lucide-react";

import GuideAccountShell from "@/features/guide/components/GuideAccountShell";
import useAuth from "@/contexts/useAuth";
import { guidesApi } from "@/features/guide/api/guidesApi";
import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";
import { useGuideVerificationStatus } from "@/features/guideVerification/hooks/useGuideVerificationStatus";
import {
  EXPERIENCE_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/features/guideVerification/constants";
import { EGYPT_GOVERNORATES } from "@/features/tours/constants/tourOptions";

const LANGUAGE_CODES = {
  Arabic: "ar",
  English: "en",
  German: "de",
  Italian: "it",
  Spanish: "es",
  French: "fr",
};

const CODE_LABELS = Object.fromEntries(
  Object.entries(LANGUAGE_CODES).map(([label, code]) => [code, label]),
);

const getAssetUrl = (value) => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value.secureUrl ?? value.secure_url ?? value.url ?? value.src ?? "";
};

const getSource = (record) =>
  record?.guide ?? record?.user ?? record?.profile ?? record ?? {};

const toLanguageLabels = (value) => {
  const source = Array.isArray(value) ? value : [];
  return source
    .map((entry) => {
      const raw =
        typeof entry === "string"
          ? entry
          : (entry?.code ?? entry?.value ?? entry?.name ?? "");
      const normalized = String(raw).trim();
      return CODE_LABELS[normalized.toLowerCase()] ?? normalized;
    })
    .filter(Boolean);
};

const toGovernorate = (...values) => {
  for (const value of values) {
    const candidate =
      typeof value === "string"
        ? value
        : (value?.city ?? value?.governorate ?? value?.name ?? "");
    const normalizedCandidate = String(candidate).trim().toLowerCase();
    const match = EGYPT_GOVERNORATES.find(
      (governorate) => governorate.toLowerCase() === normalizedCandidate,
    );

    if (match) return match;
  }

  return "";
};

const buildForm = (record, user, verification) => {
  const source = getSource(record);

  return {
    fullName: source?.fullName ?? source?.name ?? user?.fullName ?? "",
    email: source?.email ?? user?.email ?? "",
    city: toGovernorate(
      source?.city,
      source?.governorate,
      source?.location,
      user?.city,
      user?.governorate,
      user?.address,
    ),
    bio: source?.bio ?? user?.bio ?? "",
    experience: source?.experience?.year ?? user?.experience?.year ?? "",
    interests: Array.isArray(source?.interests) ? source.interests : [],
    languages: toLanguageLabels(source?.languages ?? user?.languages),
    photo:
      getAssetUrl(source?.profilePhoto) ||
      getAssetUrl(verification?.profilePhoto) ||
      getAssetUrl(verification?.verificationDocuments?.profilePhoto) ||
      getAssetUrl(user?.profilePhoto),
    video:
      getAssetUrl(source?.introductionVideo) ||
      getAssetUrl(verification?.introductionVideo) ||
      getAssetUrl(verification?.verificationDocuments?.introductionVideo),
  };
};

const EMPTY_FORM = buildForm(null, null, null);

const resolveGuideProfileId = (user, verification) => {
  const candidates = [
    verification?.guide?._id,
    verification?.guide?.id,
    verification?.guideId?._id,
    verification?.guideId?.id,
    verification?.guideId,
    user?.guideProfile?._id,
    user?.guideProfile?.id,
    user?.profile?._id,
    user?.profile?.id,
    user?.guide?._id,
    user?.guide?.id,
    user?.guideId,
  ];

  for (const candidate of candidates) {
    const id = String(candidate ?? "").trim();
    if (id) return id;
  }

  return "";
};

const shouldIgnoreProfileLoadError = (error) => {
  const message = String(error?.message ?? "")
    .trim()
    .toLowerCase();

  return (
    message.includes("guide profile not found") ||
    message.includes("not verified")
  );
};

function GovernorateSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const fieldRef = useRef(null);
  const listboxId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!fieldRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectGovernorate = (governorate) => {
    onChange(governorate);
    setIsOpen(false);
  };

  return (
    <div ref={fieldRef} className="relative mt-2">
      <button
        type="button"
        role="combobox"
        aria-label="City"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className={`flex h-12 w-full items-center gap-3 rounded-xl border px-4 text-left text-sm outline-none transition duration-200 focus:ring-3 focus:ring-[#EDC84C]/25 ${
          isOpen
            ? "border-[#010170]/60 bg-white shadow-[0_8px_24px_rgba(1,1,56,0.12)]"
            : "border-[#d8d7e8] bg-[#fdfdff] hover:border-[#aaa8cd] hover:bg-white"
        }`}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#efeff9] text-[#010170]">
          <MapPin className="h-4 w-4" aria-hidden="true" />
        </span>
        <span
          className={`min-w-0 flex-1 truncate ${
            value ? "font-medium text-[#010138]" : "text-[#77759a]"
          }`}
        >
          {value || "Select a governorate"}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#010170] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Egyptian governorates"
          className="absolute left-0 top-[calc(100%+0.55rem)] z-50 max-h-72 w-full overflow-y-auto rounded-2xl border border-[#d7d6e8] bg-white p-2 shadow-[0_20px_55px_rgba(1,1,56,0.2)] ring-1 ring-[#010170]/8 [scrollbar-color:#aaa8cd_transparent] [scrollbar-width:thin]"
        >
          <div className="grid gap-1 sm:grid-cols-2">
            {EGYPT_GOVERNORATES.map((governorate) => {
              const isSelected = governorate === value;

              return (
                <button
                  key={governorate}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectGovernorate(governorate)}
                  className={`flex min-h-10 items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "bg-gradient-to-r from-[#010170] to-[#45459b] font-semibold text-white shadow-sm"
                      : "font-medium text-[#353572] hover:bg-[#f0eff8] hover:text-[#010138]"
                  }`}
                >
                  <span>{governorate}</span>
                  {isSelected ? (
                    <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function GuideSettingsPage() {
  const { user, updateUser } = useAuth();
  const { isVerified, verification } = useGuideVerificationStatus({
    user,
    enabled: Boolean(user),
  });
  const guideProfileId = useMemo(
    () => resolveGuideProfileId(user, verification),
    [user, verification],
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const profileRequest = guideProfileId
      ? guidesApi.getPublicGuide(guideProfileId)
      : Promise.resolve(null);

    profileRequest
      .then((record) => {
        if (!isMounted) return;
        const nextForm = buildForm(record, user, verification);
        setForm(nextForm);
        setSavedForm(nextForm);
      })
      .catch((error) => {
        if (!isMounted) return;
        const nextForm = buildForm(null, user, verification);
        setForm(nextForm);
        setSavedForm(nextForm);
        if (!shouldIgnoreProfileLoadError(error)) {
          setErrorMessage(error?.message ?? "Unable to load guide settings.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [guideProfileId, user, verification]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );

  const toggleListValue = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
    setSuccessMessage("");
  };

  const saveChanges = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await guideVerificationApi.updateGuideLanguages({
        languages: form.languages.map(
          (language) => LANGUAGE_CODES[language] ?? language.toLowerCase(),
        ),
      });
      const savedProfile = await guideVerificationApi.completeGuideProfile({
        bio: form.bio.trim(),
        city: form.city,
        governorate: form.city,
        interests: form.interests,
        experience: { year: form.experience },
      });

      if (savedProfile) updateUser(savedProfile);
      setSavedForm(form);
      setSuccessMessage("Guide profile updated successfully.");
    } catch (error) {
      setErrorMessage(error?.message ?? "Unable to update guide settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GuideAccountShell>
      {isLoading ? (
        <div className="h-[540px] animate-pulse rounded-3xl bg-[#eeeeF6]" />
      ) : (
        <div className="space-y-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Account settings</h1>
              <p className="mt-2 text-sm text-[#65638a]">
                Profile information shown across tours and bookings.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/guide/complete-profile/details"
                className="inline-flex items-center gap-2 rounded-full border border-[#d3d2e6] bg-white px-4 py-2 text-xs font-semibold text-[#353572] hover:bg-[#f7f6fc]"
              >
                Edit profile
              </Link>
              {isVerified ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#eefbdc] px-4 py-2 text-xs font-semibold text-[#41651f]">
                  <BadgeCheck className="h-4 w-4" /> Verified guide
                </span>
              ) : null}
              {form.languages.length > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#eefbdc] px-4 py-2 text-xs font-semibold text-[#41651f]">
                  <Languages className="h-4 w-4" /> Languages added
                </span>
              ) : null}
            </div>
          </header>

          {errorMessage ? (
            <p className="rounded-xl border border-[#efc2c2] bg-[#fff3f3] px-4 py-3 text-sm text-[#9f2626]">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="rounded-xl border border-[#cce6b8] bg-[#f4ffe9] px-4 py-3 text-sm text-[#41651f]">
              {successMessage}
            </p>
          ) : null}

          <section className="rounded-3xl border border-[#deddec] bg-white p-5 shadow-[0_12px_38px_rgba(1,1,56,0.09)] sm:p-8">
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-[#EDC84C] bg-[#f0eff8]">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt={form.fullName ? `${form.fullName} profile` : ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-[#8d8baa]">
                  <UserRound className="h-16 w-16" />
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                ["Full name", form.fullName],
                ["Email", form.email],
              ].map(([label, value]) => (
                <label
                  key={label}
                  className="text-xs font-semibold text-[#353572]"
                >
                  {label}
                  <input
                    value={value}
                    readOnly
                    className="mt-2 h-12 w-full rounded-xl border border-[#e0dfec] bg-[#f5f4f9] px-4 text-sm text-[#010138] outline-none"
                  />
                </label>
              ))}

              <label className="text-xs font-semibold text-[#353572]">
                City
                <GovernorateSelect
                  value={form.city}
                  onChange={(city) => {
                    setForm((current) => ({ ...current, city }));
                    setSuccessMessage("");
                  }}
                />
              </label>

              <label className="text-xs font-semibold text-[#353572]">
                Experience
                <select
                  value={form.experience}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      experience: event.target.value,
                    }))
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#d8d7e8] bg-white px-4 text-sm outline-none focus:border-[#010170]"
                >
                  <option value="">Not added</option>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-5 block text-xs font-semibold text-[#353572]">
              About
              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
                rows={5}
                className="mt-2 w-full rounded-xl border border-[#d8d7e8] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#010170]"
              />
            </label>

            <div className="mt-6">
              <p className="text-xs font-semibold text-[#353572]">Languages</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => toggleListValue("languages", language)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                      form.languages.includes(language)
                        ? "border-[#010170] bg-[#010170] text-white"
                        : "border-[#c9c8db] bg-white text-[#353572]"
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold text-[#353572]">Interests</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleListValue("interests", interest)}
                    className={`rounded-full border px-5 py-2 text-xs font-semibold ${
                      form.interests.includes(interest)
                        ? "border-[#010170] bg-[#010170] text-white"
                        : "border-[#c9c8db] bg-white text-[#353572]"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                disabled={!isDirty || isSaving}
                onClick={() => setForm(savedForm)}
                className="h-11 rounded-xl border border-[#b8b7ce] px-6 text-sm font-semibold text-[#353572] disabled:opacity-40"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={!isDirty || isSaving}
                onClick={saveChanges}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#010170] to-[#5656A0] px-6 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </section>

          {form.video ? (
            <section>
              <h2 className="text-lg font-bold">Video introduction</h2>
              <video
                controls
                preload="metadata"
                className="mt-4 aspect-video w-full rounded-3xl border border-[#EDC84C] bg-[#010138] object-cover"
              >
                <source src={form.video} />
              </video>
            </section>
          ) : null}
        </div>
      )}
    </GuideAccountShell>
  );
}
