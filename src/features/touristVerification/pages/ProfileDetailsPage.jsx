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
const cameraIcon = ICONS.cameraIcon;
const plusIcon = ICONS.plusIcon;
const closeIcon = ICONS.closeIcon;
const searchIcon = ICONS.searchIcon;

// data 
const INTERESTS = [
  "Swimming", "Safari", "Adventure", "Riding", "Climbing", "Summer", "Sun rise",
  "Snorkeling", "Hiking", "Yoga", "Photography", "Food tours",
];
const LANGUAGES = ["Arabic", "English", "German", "Italian", "Spanish", "French", "Japanese"];
const TRAVEL_PREFS = ["Solo traveler", "Family", "Adventure", "Budget", "Luxury", "Cultural"];

const COUNTRIES = [
  "Egypt", "United States", "United Kingdom", "Germany", "France",
  "Italy", "Spain", "Saudi Arabia", "UAE", "Japan", "China",
  "India", "Brazil", "Canada", "Australia",
];
// tiny chip components 
function InterestChip({ label, selected, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`h-9 sm:h-10 px-4 sm:px-6 rounded-full text-sm sm:text-base font-normal transition-all ${
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
    <span className="flex items-center gap-1 bg-[#aaaacf] text-[#010170] text-sm sm:text-base font-light rounded-full px-3 sm:px-5 py-1 sm:py-1.5">
      {label}
      <button onClick={onRemove} className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
        <img src={closeIcon} alt="remove" className="w-3 h-3 sm:w-4 sm:h-4 object-contain" />
      </button>
    </span>
  );
}

function LangOption({ label, onAdd }) {
  return (
    <button
      onClick={onAdd}
      className="flex items-center gap-1 border border-[#8d8dae] text-[#5d5d95] text-sm sm:text-base font-light rounded-full px-3 sm:px-5 py-1.5 sm:py-2 hover:bg-[#f4f4f8] transition-colors"
    >
      <img src={plusIcon} alt="add" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
      {label}
    </button>
  );
}

function SectionCard({ children }) {
  return (
    <div className="bg-white border border-[#353572] rounded-xl sm:rounded-2xl shadow-[0_8px_24px_rgba(1,1,56,0.08)] p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  );
}

// Profile Photo Upload Circle 
function ProfilePhotoUpload({ previewUrl, uploading, onFileChange }) {
  const inputRef = useRef(null);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-10 text-center sm:text-left">
      <div
        className="relative shrink-0 cursor-pointer group"
        style={{ width: 100, height: 100 }}
        onClick={() => inputRef.current?.click()}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden border-3 sm:border-4 border-[#010170] flex items-center justify-center"
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
            <div className="flex flex-col items-center justify-center gap-1">
              <img src={cameraIcon} alt="upload" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
              <span className="text-[10px] sm:text-xs font-light text-[#353572]">Upload</span>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <img src={cameraIcon} alt="change" className="w-5 h-5 sm:w-6 sm:h-6 object-contain brightness-0 invert" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
            <div className="w-6 h-6 border-3 border-[#010170] border-t-transparent rounded-full animate-spin" />
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

      <div className="flex flex-col gap-1 sm:gap-2">
        <p className="text-lg sm:text-xl lg:text-2xl font-medium text-[#010138]">
          {previewUrl ? "Change photo" : "Add photo"}
        </p>
        <p className="text-sm sm:text-base lg:text-xl text-[#353572]">Profile image</p>
        <p className="text-xs sm:text-sm lg:text-lg text-[#353572]">
          Travelers with a photo are 3× more likely to be accepted by top-rated local guides.
        </p>
        {uploading && (
          <p className="text-xs sm:text-sm text-[#010170] animate-pulse">Uploading photo…</p>
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
    <div className="flex-1 min-w-[240px] flex flex-col gap-3 sm:gap-4 relative" ref={dropdownRef}>
      <p className="text-sm sm:text-base lg:text-xl font-medium text-[#353572]">Country of Residence</p>
      <div className="relative">
        <div 
          className="border border-[#aaaacf] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 cursor-text"
          onClick={() => setIsOpen(true)}
        >
          <img src={searchIcon} alt="search" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" />
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
            className="flex-1 bg-transparent text-sm sm:text-base text-[#353572] placeholder-[#353572] outline-none"
          />
        </div>

        {isOpen && (
          <div 
            className="absolute top-full left-0 right-0 mt-1.5 sm:mt-2 border border-[#aaaacf] rounded-xl sm:rounded-2xl bg-white overflow-hidden z-50"
            style={{ 
              boxShadow: "0 12px 28px rgba(1,1,56,0.15)",
              maxHeight: "240px",
              overflowY: "auto"
            }}
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country}
                  onClick={() => handleSelectCountry(country)}
                  className="w-full text-left px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base text-[#353572] hover:bg-[#f4f4f8] transition-colors border-b border-[#eeeef2] last:border-b-0"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {country}
                </button>
              ))
            ) : (
              <div className="px-4 sm:px-5 py-6 text-center text-[#353572] text-sm">
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

  const [selectedInterests, setSelectedInterests] = useState(new Set(["Swimming", "Safari", "Adventure"]));
  const [selectedLangs, setSelectedLangs] = useState(["Arabic", "English"]);
  const [selectedPrefs, setSelectedPrefs] = useState(new Set(["Solo traveler", "Family", "Adventure"]));
  const [countrySearch, setCountrySearch] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ── Load existing profile data on mount ──
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await touristApi.getProfile();
        if (profile) {
          // Set country
          if (profile.nationality) setCountrySearch(profile.nationality);
          
          // Set languages
          if (profile.preferredLanguages?.length) {
            setSelectedLangs(profile.preferredLanguages);
          }
          
          // Set interests
          if (profile.interests?.length) {
            setSelectedInterests(new Set(profile.interests));
          }
          
          // Set travel preferences
          if (profile.travelPreferences?.length) {
            setSelectedPrefs(new Set(profile.travelPreferences));
          }
          
          // Set profile photo
          if (profile.profilePhoto?.secureUrl) {
            setPreviewUrl(profile.profilePhoto.secureUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        // Don't block the user from filling out the form
      }
    };
    loadProfile();
  }, []);

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-6 sm:gap-8 lg:gap-10">
        <OnboardingStepBar step={1} />

        <div className="text-center flex flex-col gap-2 sm:gap-3">
          <p className="text-[10px] sm:text-xs lg:text-sm font-light tracking-[0.2em] text-[#010138] uppercase">
            Step 1 of 3
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-wide text-[#010138]">
            Tell Us About Your Travel Style
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#353572]">
            We'll match you with local guides who fit how you love to explore.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
          <SectionCard>
            <ProfilePhotoUpload
              previewUrl={previewUrl}
              uploading={photoUploading}
              onFileChange={handleFileChange}
            />
            {photoError && (
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-red-500">{photoError}</p>
            )}
          </SectionCard>

          <SectionCard>
            <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-[#010138] mb-1.5">
                  What pulls you to Egypt?
                </h2>
                <p className="text-sm sm:text-base lg:text-xl text-[#353572]">Pick your interests.</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
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
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-8">
              <div className="flex-1 min-w-[240px] flex flex-col gap-3 sm:gap-4">
                <p className="text-sm sm:text-base lg:text-xl font-medium text-[#353572]">Preferred Languages</p>
                <div className="border border-[#aaaacf] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex gap-2 flex-wrap">
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
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
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
            <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-[#010138] mb-1.5">Travel Preferences</h2>
                <p className="text-sm sm:text-base lg:text-xl text-[#353572]">Pick all the styles that match you.</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
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
            <p className="text-center text-xs sm:text-sm text-red-500">{saveError}</p>
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