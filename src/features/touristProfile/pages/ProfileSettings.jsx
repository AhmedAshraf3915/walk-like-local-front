import { useEffect, useState } from 'react'
import Navbar from "@/components/home/Navbar.jsx";
import AccountTabs from '../components/AccountTabs'
import { useNavigate } from 'react-router-dom'
import { Pencil, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { getTouristProfile, updateTouristProfile, uploadAndSaveProfilePhoto, getVerificationStatus } from '../services/touristProfile.js';
import useAuth from '@/contexts/useAuth';

const interestsList = ['Swimming', 'Safari', 'Adventure', 'Riding', 'Climbing', 'Summer', 'Sun rise']
const preferencesList = ['Solo traveler', 'Family', 'Adventure', 'Budget', 'Luxury']

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

function InfoField({ label, value, onChange, editing, onToggleEdit,available = true }) {
  return (
    <div className="bg-[var(--mediabackground)] rounded-2xl px-8 py-7 flex-1 min-w-[300px]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-2xl text-[var(--maintaxt)]">{label}</p>
        <div className="flex items-center gap-4 flex-1 justify-end">
          {editing ? (
            <input
              autoFocus
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onToggleEdit}
              onKeyDown={(e) => e.key === 'Enter' && onToggleEdit()}
              className="text-2xl text-[var(--maincolor)] bg-white/60 rounded-xl px-4 py-2 outline-none w-full max-w-[260px]"
            />
          ) : (
            <p className="text-2xl text-[var(--maincolor)] truncate">{value || '—'}</p>
          )}
          {available && (
            <Pencil
              onClick={onToggleEdit}
              className="size-6 text-[var(--maincolor)] cursor-pointer shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProfileSettings() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [verificationStatus, setVerificationStatus] = useState(null) // 'pending' | 'approved' | 'rejected' | null
  const [verificationLoading, setVerificationLoading] = useState(true)

  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [languages, setLanguages] = useState('')
  const [editingField, setEditingField] = useState(null) // 'fullName' | 'email' | 'country' | 'languages' | null

  const [interests, setInterests] = useState({})
  const [preferences, setPreferences] = useState({})

  const extractErrorMessage = (err) =>
    err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong'

  const loadProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getTouristProfile()
      const data = res?.data?.tourist || res?.data || res?.tourist || res

      setProfile(data)
      setFullName(data?.fullName || data?.user?.fullName || data?.userId?.fullName || data?.account?.fullName || '')
      setEmail(data?.email || data?.user?.email || data?.userId?.email || '')
      setCountry(data?.nationality || '')

      const langArr = Array.isArray(data?.preferredLanguages) ? data.preferredLanguages : []
      setLanguages(langArr.join(' , '))

      const interestsArr = Array.isArray(data?.interests) ? data.interests : []
      setInterests(Object.fromEntries(interestsArr.map((i) => [i, true])))

      const preferencesArr = Array.isArray(data?.travelPreferences) ? data.travelPreferences : []
      setPreferences(Object.fromEntries(preferencesArr.map((p) => [p, true])))
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    loadVerificationStatus()
  }, [])

  const loadVerificationStatus = async () => {
    setVerificationLoading(true)
    try {
      const res = await getVerificationStatus()
      const status = res?.data?.status || res?.status || res?.data?.verificationStatus || null
      setVerificationStatus(status)
    } catch {
      setVerificationStatus(null)
    } finally {
      setVerificationLoading(false)
    }
  }

  const toggle = (setFn) => (key) => setFn((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleDiscard = () => {
    loadProfile()
    setEditingField(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateTouristProfile({
        nationality: country,
        preferredLanguages: languages.split(',').map((l) => l.trim()).filter(Boolean),
        interests: Object.keys(interests).filter((k) => interests[k]),
        travelPreferences: Object.keys(preferences).filter((k) => preferences[k]),
      })
      setEditingField(null)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    setError(null)
    try {
      const res = await uploadAndSaveProfilePhoto(file)
      const updated = res?.data?.tourist || res?.data || res?.tourist || res
      setProfile((prev) => ({ ...prev, ...updated }))
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
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

        <section className="flex flex-col gap-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-semibold text-[var(--maintaxt)]">Account settings</h1>
              <p className="text-2xl text-[var(--maincolor)]">Personal information used across bookings</p>
            </div>

            {!verificationLoading && (
              verificationStatus === 'approved' ? (
                <span className="flex items-center gap-2 rounded-2xl px-6 py-3 bg-[rgba(46,204,113,0.12)] text-[#1e8449] font-semibold text-lg whitespace-nowrap">
                  <ShieldCheck className="size-5" />
                  Verified
                </span>
              ) : (
                <button
                  onClick={() => navigate('/onboarding/verification')}
                  className="flex items-center gap-2 rounded-2xl px-6 py-3 bg-[rgba(237,200,76,0.12)] text-[var(--darkgold)] font-semibold text-lg whitespace-nowrap border border-[var(--lightgold)]"
                >
                  <ShieldAlert className="size-5" />
                  {verificationStatus === 'rejected' ? 'Verification rejected · Retry' : 'Complete verification'}
                </button>
              )
            )}
          </div>

          <div className="flex flex-col items-center gap-10">
            <div className="relative w-[320px] h-[320px]">
              <img
                src={photoUrl}
                alt="profile"
                className="w-full h-full rounded-full object-cover"
              />
              {/* <label className="absolute bottom-[10px] right-[10px] bg-[var(--maintaxt)] border-[3px] border-[var(--background)] rounded-full p-5 cursor-pointer">
                {uploadingPhoto ? (
                  <Loader2 className="size-8 text-white animate-spin" />
                ) : (
                  <Pencil className="size-8 text-white" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploadingPhoto} />
              </label> */}
            </div>

            <div className="flex flex-col gap-10 w-full">
              <div className="flex flex-col md:flex-row gap-6">
                <InfoField label="Full name" value={fullName} editing={false} onToggleEdit={() => {}} available={false} />
                <InfoField label="Email" value={email} editing={false} onToggleEdit={() => {}} available={false} />
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <InfoField
                  label="Country"
                  value={country}
                  onChange={setCountry}
                  editing={editingField === 'country'}
                  onToggleEdit={() => setEditingField((f) => (f === 'country' ? null : 'country'))}
                />
                <InfoField
                  label="Languages"
                  value={languages}
                  onChange={setLanguages}
                  editing={editingField === 'languages'}
                  onToggleEdit={() => setEditingField((f) => (f === 'languages' ? null : 'languages'))}
                />
              </div>
            </div>
          </div>

        </section>

        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-semibold text-[var(--maintaxt)]">Interests</h2>
            <p className="text-2xl text-[var(--maincolor)]">Tap to toggle your travel interests:</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {interestsList.map((label) => (
              <Pill
                key={label}
                label={label}
                active={!!interests[label]}
                onClick={() => toggle(setInterests)(label)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-semibold text-[var(--maintaxt)]">Preferences</h2>
            <p className="text-2xl text-[var(--maincolor)]">Tap to toggle your travel preferences:</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {preferencesList.map((label) => (
              <Pill
                key={label}
                label={label}
                active={!!preferences[label]}
                onClick={() => toggle(setPreferences)(label)}
              />
            ))}
          </div>
                    <div className="flex gap-6">
            <button
              onClick={handleDiscard}
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


        {/* ── Sign out ─────────────────────────────────────────── */}
        <section className="flex flex-col gap-6 border-t border-[rgba(228,29,29,0.2)] pt-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-[rgba(174,24,24,0.9)]">Sign out</h2>
            <p className="text-lg text-[var(--mediumfont)]">
              You will be signed out of your account on this device.
            </p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="self-start h-12 px-10 rounded-2xl border border-[rgba(228,29,29,0.5)] text-[rgba(174,24,24,0.9)] font-medium text-lg hover:bg-[rgba(228,29,29,0.06)] transition-colors"
          >
            Log out
          </button>
        </section>

      </main>
    </div>
  )
}