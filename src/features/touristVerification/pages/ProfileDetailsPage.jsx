import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { touristApi } from "../api/touristApi";
import { ICONS } from "../../../assets/images/touristVerification/images.js";

// asset refs 
const cameraIcon   = ICONS.cameraIcon;
const plusIcon     = ICONS.plusIcon;
const closeIcon    = ICONS.closeIcon;
const searchIcon   = ICONS.searchIcon;

// data 
const INTERESTS = [
  "Swimming","Safari","Adventure","Riding","Climbing","Summer","Sun rise",
  "Snorkeling","Hiking","Yoga","Photography","Food tours",
];
const LANGUAGES = ["Arabic","English","German","Italian","Spanish","French","Japanese"];
const TRAVEL_PREFS = ["Solo traveler","Family","Adventure","Budget","Luxury","Cultural"];

const COUNTRIES = [
  "Egypt",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Saudi Arabia",
  "UAE",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Canada",
  "Australia",
];

// tiny chip components 
function InterestChip({ label, selected, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`h-12 px-8 rounded-full text-lg font-normal transition-all ${
        selected
          ? "bg-[#010170] text-white shadow-[0_2px_6px_rgba(170,170,207,0.8)]"
          : "border border-[#353572] text-[#010138] shadow-[0_0_5px_#cccce2] hover:bg-[#f4f4f8]"
      }`}
    >
      {label}
    </button>
  );
}

function LangTag({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 bg-[#aaaacf] text-[#010170] text-lg font-light rounded-full px-6 py-2">
      {label}
      <button onClick={onRemove} className="w-5 h-5 flex items-center justify-center">
        <img src={closeIcon} alt="remove" className="w-4 h-4 object-contain" />
      </button>
    </span>
  );
}

function LangOption({ label, onAdd }) {
  return (
    <button
      onClick={onAdd}
      className="flex items-center gap-1 border border-[#8d8dae] text-[#5d5d95] text-lg font-light rounded-full px-6 py-2.5 hover:bg-[#f4f4f8] transition-colors"
    >
      <img src={plusIcon} alt="add" className="w-5 h-5 object-contain" />
      {label}
    </button>
  );
}

function SectionCard({ children }) {
  return (
    <div className="bg-white border border-[#353572] rounded-2xl shadow-[0_8px_24px_rgba(1,1,56,0.08)] p-10">
      {children}
    </div>
  );
}

// Profile Photo Upload Circle 
function ProfilePhotoUpload({ previewUrl, uploading, onFileChange }) {
  const inputRef = useRef(null);

  return (
    <div className="flex items-center gap-10">
      <div
        className="relative shrink-0 cursor-pointer group"
        style={{ width: 160, height: 160 }}
        onClick={() => inputRef.current?.click()}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden border-4 border-[#010170] flex items-center justify-center"
          style={{
            background: previewUrl
              ? "transparent"
              : "linear-gradient(135deg, #aaaacf 0%, #cccce2 100%)",
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <img src={cameraIcon} alt="upload" className="w-10 h-10 object-contain" />
              <span className="text-sm font-light text-[#353572]">Upload</span>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <img src={cameraIcon} alt="change" className="w-8 h-8 object-contain brightness-0 invert" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="flex flex-col gap-3">
        <p className="text-2xl font-medium text-[#010138]">
          {previewUrl ? "Change photo" : "Add photo"}
        </p>
        <p className="text-xl text-[#353572]">Profile image</p>
        <p className="text-lg text-[#353572]">
          Travelers with a photo are 3× more likely to be accepted by top-rated local guides.
        </p>
        {uploading && (
          <p className="text-sm text-[#010170] animate-pulse">Uploading photo…</p>
        )}
      </div>
    </div>
  );
}

function CountryDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const dropdownRef = useRef(null);

  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (country) => {
    setSearchTerm(country);
    onChange(country);
    setIsOpen(false);
  };

  return (
    <div className="flex-1 min-w-[280px] flex flex-col gap-5 relative" ref={dropdownRef}>
      <p className="text-xl font-medium text-[#353572]">Country of Residence</p>
      <div className="relative">
        <div 
          className="border border-[#aaaacf] rounded-2xl px-6 py-4 flex items-center gap-3 cursor-text"
          onClick={() => setIsOpen(true)}
        >
          <img src={searchIcon} alt="search" className="w-6 h-6 object-contain shrink-0" />
          <input
            type="text"
            placeholder="Search Country .."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="flex-1 bg-transparent text-lg text-[#353572] placeholder-[#353572] outline-none"
          />
        </div>

        {isOpen && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 border border-[#aaaacf] rounded-2xl bg-white overflow-hidden z-50"
            style={{ 
              boxShadow: "0 12px 28px rgba(1,1,56,0.15)",
              maxHeight: "280px",
              overflowY: "auto"
            }}
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country}
                  onClick={() => handleSelectCountry(country)}
                  className="w-full text-left px-6 py-3 text-lg text-[#353572] hover:bg-[#f4f4f8] transition-colors border-b border-[#eeeef2] last:border-b-0"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {country}
                </button>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-[#353572] text-base">
                No countries found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Page
export default function ProfileDetailsPage() {
  const navigate = useNavigate();

  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  const [selectedInterests, setSelectedInterests] = useState(
    new Set(["Swimming", "Safari", "Adventure"])
  );
  const [selectedLangs, setSelectedLangs] = useState(["Arabic", "English"]);
  const [selectedPrefs, setSelectedPrefs] = useState(
    new Set(["Solo traveler", "Family", "Adventure"])
  );
  const [countrySearch, setCountrySearch] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const availableLangs = LANGUAGES.filter((l) => !selectedLangs.includes(l));

  const toggleInterest = (i) =>
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const togglePref = (p) =>
    setSelectedPrefs((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setPhotoError(null);
    setPhotoUploading(true);

    try {
      await touristApi.updateProfilePhoto(file);
    } catch (err) {
      setPhotoError("Photo upload failed. Your profile was saved without a photo.");
      console.error(err);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await touristApi.updateProfile({
        nationality: countrySearch.trim() || undefined,
        preferredLanguages: selectedLangs,
        interests: [...selectedInterests],
        travelPreferences: [...selectedPrefs],
      });
      navigate("/onboarding/verification");
    } catch (err) {
      setSaveError("Could not save your profile. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingPage>
      <div className="max-w-[1440px] mx-auto px-8 py-12 flex flex-col gap-12">
        <OnboardingStepBar step={1} />

        <div className="text-center flex flex-col gap-5">
          <p className="text-sm font-light tracking-[0.2em] text-[#010138] uppercase">
            Step 1 of 3
          </p>
          <h1 className="text-4xl font-semibold tracking-wide text-[#010138]">
            Tell Us About Your Travel Style
          </h1>
          <p className="text-2xl text-[#353572]">
            We'll match you with local guides who fit how you love to explore.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <SectionCard>
            <ProfilePhotoUpload
              previewUrl={previewUrl}
              uploading={photoUploading}
              onFileChange={handleFileChange}
            />
            {photoError && (
              <p className="mt-4 text-sm text-red-500">{photoError}</p>
            )}
          </SectionCard>

          <SectionCard>
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-medium text-[#010138] mb-2">
                  What pulls you to Egypt?
                </h2>
                <p className="text-xl text-[#353572]">Pick your interests.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {INTERESTS.map((i) => (
                  <InterestChip
                    key={i}
                    label={i}
                    selected={selectedInterests.has(i)}
                    onToggle={() => toggleInterest(i)}
                  />
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex gap-12 flex-wrap">
              <div className="flex-1 min-w-[280px] flex flex-col gap-5">
                <p className="text-xl font-medium text-[#353572]">Preferred Languages</p>
                <div className="border border-[#aaaacf] rounded-2xl px-6 py-4 flex gap-3 flex-wrap">
                  {selectedLangs.map((l) => (
                    <LangTag
                      key={l}
                      label={l}
                      onRemove={() =>
                        setSelectedLangs((prev) => prev.filter((x) => x !== l))
                      }
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableLangs.map((l) => (
                    <LangOption
                      key={l}
                      label={l}
                      onAdd={() => setSelectedLangs((prev) => [...prev, l])}
                    />
                  ))}
                </div>
              </div>

              <CountryDropdown 
                value={countrySearch} 
                onChange={setCountrySearch} 
              />
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-medium text-[#010138] mb-2">Travel Preferences</h2>
                <p className="text-xl text-[#353572]">Pick all the styles that match you.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {TRAVEL_PREFS.map((p) => (
                  <InterestChip
                    key={p}
                    label={p}
                    selected={selectedPrefs.has(p)}
                    onToggle={() => togglePref(p)}
                  />
                ))}
              </div>
            </div>
          </SectionCard>

          {saveError && (
            <p className="text-center text-sm text-red-500">{saveError}</p>
          )}
        </div>
      </div>

      <OnboardingFooter
        backTo="/"
        onContinue={handleContinue}
        continueLabel={saving ? "Saving…" : "Continue"}
        continueEnabled={!saving && !photoUploading}
        skipLabel="Skip for now"
        onSkip={() => navigate("/onboarding/verification")}
      />
    </OnboardingPage>
  );
}