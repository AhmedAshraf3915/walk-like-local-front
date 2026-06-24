import { useEffect, useRef, useState } from 'react'
import Navbar from "@/components/home/Navbar.jsx";
import AccountTabs from '../components/AccountTabs'
import { useNavigate } from 'react-router-dom'
import { Loader2, ShieldCheck, ShieldAlert, X, Plus } from 'lucide-react'
import { getTouristProfile, updateTouristProfile, getVerificationStatus } from '../services/touristProfile.js';
import useAuth from '@/contexts/useAuth';

// ── Data ──────────────────────────────────────────────────────────────────────
const INTERESTS_LIST   = ['Swimming', 'Safari', 'Adventure', 'Riding', 'Climbing', 'Summer', 'Sun rise']
const PREFERENCES_LIST = ['Solo traveler', 'Family', 'Adventure', 'Budget', 'Luxury']
const LANGUAGES        = ['Arabic', 'English', 'German', 'Italian', 'Spanish', 'French', 'Japanese']
const COUNTRIES        = [
  'Egypt', 'United States', 'United Kingdom', 'Germany', 'France',
  'Italy', 'Spain', 'Saudi Arabia', 'UAE', 'Japan', 'China',
  'India', 'Brazil', 'Canada', 'Australia',
]

// ── Pill (interests / preferences) ───────────────────────────────────────────
function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`h-[60px] px-10 rounded-full text-2xl whitespace-nowrap transition-colors ${
        active
          ? 'bg-[var(--maincolor)] text-white shadow-[0px_2px_6px_0px_var(--lighttext)]'
          : 'border border-[var(--mediumfont)] text-[var(--maintaxt)] shadow-[0px_0px_5px_0px_var(--lightblue)]'
      }`}
    >
      {label}
    </button>
  )
}

// ── Language picker ───────────────────────────────────────────────────────────
function LangTag({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 bg-[#aaaacf] text-[#010170] text-base font-light rounded-full px-4 py-1.5">
      {label}
      <button onClick={onRemove} className="w-5 h-5 flex items-center justify-center ml-1" aria-label={`Remove ${label}`}>
        <X className="size-3" />
      </button>
    </span>
  )
}

function LangOption({ label, onAdd }) {
  return (
    <button
      onClick={onAdd}
      className="flex items-center gap-1 border border-[#8d8dae] text-[#5d5d95] text-base font-light rounded-full px-4 py-2 hover:bg-[#f4f4f8] transition-colors"
    >
      <Plus className="size-4" />
      {label}
    </button>
  )
}

function LanguagePicker({ selected, onChange }) {
  const available = LANGUAGES.filter((l) => !selected.includes(l))
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xl text-[var(--maintaxt)]">Languages</p>
      <div className="min-h-[48px] border border-[#aaaacf] rounded-2xl px-4 py-3 flex gap-2 flex-wrap bg-white/60">
        {selected.length === 0 && <span className="text-base text-[#aaaacf]">No languages selected</span>}
        {selected.map((l) => (
          <LangTag key={l} label={l} onRemove={() => onChange(selected.filter((x) => x !== l))} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {available.map((l) => (
          <LangOption key={l} label={l} onAdd={() => onChange([...selected, l])} />
        ))}
      </div>
    </div>
  )
}

// ── Country dropdown ──────────────────────────────────────────────────────────
function CountryDropdown({ value, onChange }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState(value)
  const ref                 = useRef(null)

  useEffect(() => { setSearch(value) }, [value])

  const filtered = COUNTRIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    function onOut(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [])

  const select = (country) => { setSearch(country); onChange(country); setOpen(false) }

  return (
    <div className="flex flex-col gap-3 relative" ref={ref}>
      <p className="text-xl text-[var(--maintaxt)]">Country</p>
      <div
        className="border border-[#aaaacf] rounded-2xl px-5 py-3 flex items-center gap-2 cursor-text bg-white/60"
        onClick={() => setOpen(true)}
      >
        <input
          type="text"
          placeholder="Search country…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent text-base text-[#353572] placeholder-[#aaaacf] outline-none"
        />
      </div>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 border border-[#aaaacf] rounded-2xl bg-white z-50 overflow-hidden"
          style={{ boxShadow: '0 12px 28px rgba(1,1,56,0.15)', maxHeight: 240, overflowY: 'auto' }}
        >
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <button
                key={c}
                onClick={() => select(c)}
                className="w-full text-left px-5 py-2.5 text-base text-[#353572] hover:bg-[#f4f4f8] transition-colors border-b border-[#eeeef2] last:border-b-0"
              >
                {c}
              </button>
            ))
          ) : (
            <div className="px-5 py-6 text-center text-[#353572] text-sm">No countries found</div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Read-only field (name / email) ────────────────────────────────────────────
function ReadOnlyField({ label, value }) {
  return (
    <div className="bg-[var(--mediabackground)] rounded-2xl px-8 py-7 flex-1 min-w-[300px]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-2xl text-[var(--maintaxt)]">{label}</p>
        <p className="text-2xl text-[var(--maincolor)] truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProfileSettings() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [loading,             setLoading]             = useState(true)
  const [error,               setError]               = useState(null)
  const [saving,              setSaving]              = useState(false)
  const [verificationStatus,  setVerificationStatus]  = useState(null)
  const [verificationLoading, setVerificationLoading] = useState(true)

  const [profile,     setProfile]     = useState(null)
  const [fullName,    setFullName]     = useState('')
  const [email,       setEmail]        = useState('')
  const [country,     setCountry]      = useState('')
  const [languages,   setLanguages]    = useState([])
  const [interests,   setInterests]    = useState({})
  const [preferences, setPreferences]  = useState({})

  const extractError = (err) =>
    err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong'

  const loadProfile = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await getTouristProfile()
      const data = res?.data?.tourist || res?.data || res?.tourist || res

      setProfile(data)
      setFullName(data?.fullName || data?.user?.fullName || data?.userId?.fullName || data?.account?.fullName || '')
      setEmail(data?.email || data?.user?.email || data?.userId?.email || '')
      setCountry(data?.nationality || '')
      setLanguages(Array.isArray(data?.preferredLanguages) ? data.preferredLanguages : [])
      setInterests(Object.fromEntries((Array.isArray(data?.interests) ? data.interests : []).map((i) => [i, true])))
      setPreferences(Object.fromEntries((Array.isArray(data?.travelPreferences) ? data.travelPreferences : []).map((p) => [p, true])))
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

const loadVerification = async () => {
    setVerificationLoading(true);
    try {
      const res = await getVerificationStatus(); 
      
      setVerificationStatus(res); 
      console.log("Status from API:", res); 
    } catch (err) {
      console.error("Error loading verification:", err);
      setVerificationStatus(null);
    } finally {
      setVerificationLoading(false);
    }
  };

  useEffect(() => { loadProfile(); loadVerification() }, [])

  const toggle = (setFn) => (key) => setFn((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      await updateTouristProfile({
        nationality:        country,
        preferredLanguages: languages,
        interests:          Object.keys(interests).filter((k) => interests[k]),
        travelPreferences:  Object.keys(preferences).filter((k) => preferences[k]),
      })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const photoUrl =
    profile?.profilePhoto?.secureUrl ||
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrb4OvIZOz-Z2RvlJ0xDl1E_e3qOfh_TQK1va1Z7gJ4g&s=10?w=400&h=400&fit=crop'

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
          <Loader2 className="size-10 animate-spin text-[var(--maincolor)]" />
          <p className="text-xl text-[var(--mediumfont)]">Loading your profile…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16 flex flex-col gap-16">
        <AccountTabs />

        {error && (
          <div className="bg-[rgba(228,29,29,0.1)] border border-[rgba(228,29,29,0.5)] text-[rgba(174,24,24,0.9)] rounded-2xl px-6 py-4 text-lg">
            {error}
          </div>
        )}

{/* ── Header + verification badge ────────────────────────────────── */}
<section className="flex flex-col gap-12">
  <div className="flex flex-wrap items-center justify-between gap-6">
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold text-[var(--maintaxt)]">Account settings</h1>
      <p className="text-2xl text-[var(--maincolor)]">Personal information used across bookings</p>
    </div>

{!verificationLoading && (
  (() => {
    const successKeywords = ['approved', 'success', 'succeeded', 'pass', 'passed', 'verified'];
    
    const isVerified = successKeywords.includes(verificationStatus?.toLowerCase());
    
    if (isVerified) {
      return (
        <span className="flex items-center gap-2 rounded-2xl px-6 py-3 bg-[rgba(46,204,113,0.12)] text-[#1e8449] font-semibold text-lg whitespace-nowrap border border-[rgba(46,204,113,0.3)] select-none cursor-default">
          <ShieldCheck className="size-5" />
          Verified
        </span>
      );
    } else if (verificationStatus === 'pending') {
      return (
        <span className="flex items-center gap-2 rounded-2xl px-6 py-3 bg-[rgba(237,200,76,0.12)] text-[var(--darkgold)] font-semibold text-lg whitespace-nowrap border border-[var(--lightgold)] select-none cursor-default">
          <ShieldAlert className="size-5" />
          Under review
        </span>
      );
    } else {
      return (
        <button
          onClick={() => navigate('/onboarding/verification')}
          className="flex items-center gap-2 rounded-2xl px-6 py-3 bg-[rgba(237,200,76,0.12)] text-[var(--darkgold)] font-semibold text-lg whitespace-nowrap border border-[var(--lightgold)]"
        >
          <ShieldAlert className="size-5" />
          {verificationStatus === 'rejected' ? 'Verification rejected · Retry' : 'Complete verification'}
        </button>
      );
    }
  })()
)}
  </div>
  
  {/* Avatar + read-only fields remains the same below... */}

          {/* Avatar + read-only fields */}
          <div className="flex flex-col items-center gap-10">
            <div className="w-[320px] h-[320px]">
              <img src={photoUrl} alt="profile" className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col md:flex-row gap-6">
                <ReadOnlyField label="Full name" value={fullName} />
                <ReadOnlyField label="Email"     value={email}    />
              </div>
            </div>
          </div>
        </section>
  {/* ... rest of the component */}

        {/* ── Country & Language ─────────────────────────────────────────── */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold text-[var(--maintaxt)]">Location &amp; Language</h2>
            <p className="text-2xl text-[var(--maincolor)]">Used to personalise your experience</p>
          </div>
          <div className="bg-[var(--mediabackground)] rounded-2xl px-8 py-8 flex flex-col md:flex-row gap-10">
            <div className="flex-1 min-w-[260px]">
              <CountryDropdown value={country} onChange={setCountry} />
            </div>
            <div className="flex-1 min-w-[260px]">
              <LanguagePicker selected={languages} onChange={setLanguages} />
            </div>
          </div>
        </section>

        {/* ── Interests ─────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-semibold text-[var(--maintaxt)]">Interests</h2>
            <p className="text-2xl text-[var(--maincolor)]">Tap to toggle your travel interests:</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {INTERESTS_LIST.map((label) => (
              <Pill key={label} label={label} active={!!interests[label]} onClick={() => toggle(setInterests)(label)} />
            ))}
          </div>
        </section>

        {/* ── Preferences ───────────────────────────────────────────────── */}
        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-semibold text-[var(--maintaxt)]">Preferences</h2>
            <p className="text-2xl text-[var(--maincolor)]">Tap to toggle your travel preferences:</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {PREFERENCES_LIST.map((label) => (
              <Pill key={label} label={label} active={!!preferences[label]} onClick={() => toggle(setPreferences)(label)} />
            ))}
          </div>
          <div className="flex gap-6">
            <button
              onClick={loadProfile}
              disabled={saving}
              className="h-14 px-12 rounded-2xl border border-[#010170] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-[var(--maintaxt)] font-medium text-xl disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-14 px-12 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-medium text-xl disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="size-5 animate-spin" />}
              Save changes
            </button>
          </div>
        </section>

        {/* ── Sign out ──────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-6 border-t border-[rgba(228,29,29,0.2)] pt-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-[rgba(174,24,24,0.9)]">Sign out</h2>
            <p className="text-lg text-[var(--mediumfont)]">You will be signed out of your account on this device.</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="self-start h-12 px-10 rounded-2xl border border-[rgba(228,29,29,0.5)] text-[rgba(174,24,24,0.9)] font-medium text-lg hover:bg-[rgba(228,29,29,0.06)] transition-colors"
          >
            Log out
          </button>
        </section>
      </main>
    </div>
  )
}