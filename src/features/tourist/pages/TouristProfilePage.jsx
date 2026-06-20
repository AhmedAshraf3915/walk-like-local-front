import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { touristApi } from "@/features/touristVerification/api/touristApi";

const INTEREST_OPTIONS = [
  "History", "Food", "Photography", "Adventure",
  "Culture", "Markets", "Architecture", "Nature",
  "Swimming", "Safari", "Riding", "Climbing", "Hiking", "Yoga",
];

const LANGUAGE_OPTIONS = [
  { label: "Arabic", value: "ar" },
  { label: "English", value: "en" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
];

export default function TouristProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState("");
  const [interests, setInterests] = useState([]);
  const [travelPreferences, setTravelPreferences] = useState([]);
  const [preferredLanguages, setPreferredLanguages] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    touristApi.getProfile()
      .then((data) => {
        setProfile(data);
        setFullName(data.fullName || "");
        setNationality(data.nationality || "");
        setInterests(data.interests || []);
        setTravelPreferences(data.travelPreferences || []);
        setPreferredLanguages(data.preferredLanguages || []);
        setPreviewUrl(data.profilePhoto?.secureUrl || null);
      })
      .catch(() => setMsg({ type: "error", text: "Failed to load profile." }))
      .finally(() => { setLoading(false); setLoaded(true); });
  }, []);

  const toggleInterest = (i) =>
    setInterests((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  const togglePref = (p) =>
    setTravelPreferences((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const toggleLang = (code) =>
    setPreferredLanguages((p) => p.includes(code) ? p.filter((x) => x !== code) : [...p, code]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg({ type: "", text: "" });
    try {
      const result = await touristApi.updateProfilePhoto(file);
      const url = result?.profilePhoto?.secureUrl || URL.createObjectURL(file);
      setPreviewUrl(url);
      setMsg({ type: "success", text: "Photo updated." });
    } catch {
      setMsg({ type: "error", text: "Photo upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      await touristApi.updateProfile({
        nationality: nationality.trim() || undefined,
        preferredLanguages,
        interests,
        travelPreferences,
      });
      setMsg({ type: "success", text: "Profile saved." });
    } catch {
      setMsg({ type: "error", text: "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f3f2fa] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#f3f2fa]">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
        <div className="rounded-xl sm:rounded-2xl border border-[#dddced] bg-white p-4 sm:p-6 lg:p-8 shadow-[0_20px_50px_rgba(32,30,88,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-[#7b79a8]">
                Tourist Profile
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#100f45]">{fullName || "Your Profile"}</h1>
            </div>
            <div className="flex gap-2">
              <Link to="/tourist/verification" className="rounded-full border border-[#cfcee6] bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-[#323166]">
                Verification
              </Link>
              <Link to="/tours" className="rounded-full bg-[#1d1a7d] px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white">
                Browse Tours
              </Link>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative shrink-0 cursor-pointer group" onClick={() => fileRef.current?.click()}>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-[#010170] flex items-center justify-center bg-[#f4f4f8]">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-[#353572]">Add photo</span>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                    <div className="w-5 h-5 border-3 border-[#010170] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm sm:text-base font-medium text-[#010138]">{previewUrl ? "Change photo" : "Add photo"}</p>
                <p className="text-xs text-[#353572]">Profile image</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#23225e] mb-1">Nationality</label>
                <input value={nationality} onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g. Egyptian" maxLength={100}
                  className="w-full rounded-xl border border-[#d2d1e8] bg-[#fcfcff] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none ring-[#2b2894] focus:ring-2" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#23225e] mb-1">Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name" maxLength={100}
                  className="w-full rounded-xl border border-[#d2d1e8] bg-[#fcfcff] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none ring-[#2b2894] focus:ring-2" />
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#23225e] mb-2">Interests</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {INTEREST_OPTIONS.map((i) => {
                  const sel = interests.includes(i);
                  return (
                    <button key={i} type="button" onClick={() => toggleInterest(i)}
                      className={`rounded-full border px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition ${sel ? "border-[#1f1c83] bg-[#1f1c83] text-white" : "border-[#cbc9e4] bg-white text-[#403e6b]"}`}>
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#23225e] mb-2">Travel Preferences</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {["Solo traveler", "Family", "Adventure", "Budget", "Luxury", "Cultural"].map((p) => {
                  const sel = travelPreferences.includes(p);
                  return (
                    <button key={p} type="button" onClick={() => togglePref(p)}
                      className={`rounded-full border px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition ${sel ? "border-[#1f1c83] bg-[#1f1c83] text-white" : "border-[#cbc9e4] bg-white text-[#403e6b]"}`}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#23225e] mb-2">Preferred Languages</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const sel = preferredLanguages.includes(lang.value);
                  return (
                    <button key={lang.value} type="button" onClick={() => toggleLang(lang.value)}
                      className={`rounded-full border px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition ${sel ? "border-[#1f1c83] bg-[#1f1c83] text-white" : "border-[#cbc9e4] bg-white text-[#403e6b]"}`}>
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {msg.text && (
              <p className={`rounded-xl border px-3 sm:px-4 py-2 text-xs sm:text-sm ${msg.type === "error" ? "border-[#efc2c2] bg-[#fff2f2] text-[#a12121]" : "border-[#bedfb8] bg-[#eefce9] text-[#1f6a21]"}`}>
                {msg.text}
              </p>
            )}

            <button type="submit" disabled={saving || uploading}
              className="rounded-full bg-[#151270] px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_12px_26px_rgba(21,18,112,0.3)] disabled:opacity-60">
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
