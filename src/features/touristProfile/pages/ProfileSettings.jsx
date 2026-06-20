import { useState } from 'react'
import Navbar from "@/components/home/Navbar.jsx";
import AccountTabs from '../components/AccountTabs'
import { Pencil } from 'lucide-react'

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

function InfoField({ label, value }) {
  return (
    <div className="bg-[var(--mediabackground)] rounded-2xl px-8 py-7 flex-1 min-w-[300px]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-2xl text-[var(--maintaxt)]">{label}</p>
        <div className="flex items-center gap-4">
          <p className="text-2xl text-[var(--maincolor)]">{value}</p>
          <Pencil className="size-6 text-[var(--maincolor)] cursor-pointer shrink-0" />
        </div>
      </div>
    </div>
  )
}

export default function ProfileSettings() {
  const [interests, setInterests] = useState({ Swimming: true, Safari: true, Adventure: true })
  const [preferences, setPreferences] = useState({ 'Solo traveler': true, Family: true, Adventure: true })

  const toggle = (setFn) => (key) => setFn((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16 flex flex-col gap-16">
        <AccountTabs />

        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold text-[var(--maintaxt)]">Account settings</h1>
            <p className="text-2xl text-[var(--maincolor)]">Personal information used across bookings</p>
          </div>

          <div className="flex flex-col items-center gap-10">
            <div className="relative w-[320px] h-[320px]">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
                alt="profile"
                className="w-full h-full rounded-full object-cover"
              />
              <button className="absolute bottom-[10px] right-[10px] bg-[var(--maintaxt)] border-[3px] border-[var(--background)] rounded-full p-5">
                <Pencil className="size-8 text-white" />
              </button>
            </div>

            <div className="flex flex-col gap-10 w-full">
              <div className="flex flex-col md:flex-row gap-6">
                <InfoField label="Full name" value="Léa Marchand" />
                <InfoField label="Email" value="lea.marchand@gmail.com" />
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <InfoField label="Country" value="France" />
                <InfoField label="Languages" value="English , French" />
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <button className="h-14 px-12 rounded-2xl border border-[#010170] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-[var(--maintaxt)] font-medium text-xl">
              Discard
            </button>
            <button className="h-14 px-12 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-medium text-xl">
              Save changes
            </button>
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
        </section>
      </main>
    </div>
  )
}
