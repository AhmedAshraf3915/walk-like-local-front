import { useState } from 'react'
import Navbar from "@/components/home/Navbar.jsx";
import AccountTabs from '../components/AccountTabs'
import CancelModal from '../components/CancelModal'
import {
  Hourglass,
  Calendar,
  Clock as ClockIcon,
  MapPin,
  Check,
  Star,
  X as XIcon,
  Gift,
  QrCode,
  MessageCircle,
} from 'lucide-react'

const upcoming = [
  {
    id: 1,
    title: 'Coptic Cairo Heritage Walk',
    guide: 'Nour Hassan',
    city: 'Cairo',
    date: 'Sat, Jun 21',
    time: '09:00',
    daysToGo: '7 days to go',
    price: '$30',
    withinRefundWindow: true,
    isToday: true,
    image:
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&h=450&fit=crop',
  },
  {
    id: 2,
    title: 'Khan El-Khalili Night Bites',
    guide: 'Nour Hassan',
    city: 'Cairo',
    date: 'Wed, Jun 25',
    time: '09:00',
    daysToGo: '13 days to go',
    price: '$56',
    withinRefundWindow: false,
    isToday: false,
  },
]

const past = [
  { id: 1, title: 'Coptic Cairo Heritage Walk', guide: 'Nour Hassan', city: 'Cairo', date: 'Sat, Jun 21', price: '$30' },
  { id: 2, title: 'Coptic Cairo Heritage Walk', guide: 'Nour Hassan', city: 'Cairo', date: 'Sat, Jun 21', price: '$30' },
]

const cancelled = [
  {
    id: 1,
    title: 'Coptic Cairo Heritage Walk',
    guide: 'Nour Hassan',
    city: 'Cairo',
    date: 'Sat, Jun 21',
    reason: 'Guide cancelled',
    credit: '+$70',
  },
  {
    id: 2,
    title: 'Coptic Cairo Heritage Walk',
    guide: 'Nour Hassan',
    city: 'Cairo',
    date: 'Sat, Jun 21',
    reason: 'Tourist cancelled',
    credit: '+$70',
  },
]

function Pill({ icon: Icon, label }) {
  return (
    <div className="bg-[var(--mediabackground)] border border-[var(--lighttext)] rounded-full px-10 py-2 flex items-center gap-2">
      <Icon className="size-6 text-[var(--maincolor)]" />
      <span className="text-xl font-medium text-[var(--maincolor)]">{label}</span>
    </div>
  )
}

function TodayCard({ booking }) {
  return (
    <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[8px_8px_24px_0px_rgba(1,1,112,0.15)] px-8 md:px-12 py-10 w-full">
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-10 items-start justify-between">
          <div className="flex flex-wrap gap-10">
            <img
              src={booking.image}
              alt={booking.title}
              className="w-[314px] h-[231px] object-cover rounded-2xl shrink-0"
            />
            <div className="flex flex-col gap-10">
              <p className="text-[var(--secondarycolor)] font-semibold tracking-[1.4px] uppercase text-lg">Confirmed</p>
              <div className="flex flex-col gap-4">
                <p className="text-3xl font-medium text-[var(--maincolor)]">{booking.title}</p>
                <p className="text-2xl text-[var(--mediumfont)]">with {booking.guide} · {booking.city}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Pill icon={Calendar} label={booking.date} />
                <Pill icon={ClockIcon} label={booking.time} />
                <Pill icon={MapPin} label={booking.city} />
              </div>
            </div>
          </div>
          <div className="bg-[var(--lightgold)] rounded-2xl px-4 py-3 flex items-center gap-2 shrink-0">
            <Hourglass className="size-5 text-[var(--maintaxt)]" />
            <span className="text-[var(--maintaxt)] font-semibold text-lg whitespace-nowrap">{booking.date}</span>
          </div>
        </div>

        <hr className="border-[var(--lighttext)]" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-2xl font-medium text-[var(--maincolor)]">{booking.price} · Paid</p>
          <button className="h-14 px-10 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-semibold text-lg flex items-center gap-2">
            Begin tour <QrCode className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function UpcomingCard({ booking, onCancel }) {
  // "near-term" bookings (not today, but with days-to-go) get a Message guide button too
  return (
    <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[8px_8px_24px_0px_rgba(1,1,112,0.15)] px-8 md:px-12 py-8 flex-1 min-w-[320px]">
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap gap-6 items-start justify-between">
          <div className="flex flex-col gap-8">
            <p className="text-[var(--secondarycolor)] font-semibold tracking-[1.4px] uppercase text-lg">Confirmed</p>
            <div className="flex flex-col gap-4">
              <p className="text-2xl font-medium text-[var(--maincolor)]">{booking.title}</p>
              <p className="text-xl text-[var(--mediumfont)]">with {booking.guide} · {booking.city}</p>
            </div>
          </div>
          <div className="bg-gradient-to-b from-[var(--maincolor)] to-[var(--maintaxt)] rounded-2xl px-4 py-3 flex items-center gap-2 shrink-0">
            <Hourglass className="size-5 text-white" />
            <span className="text-white font-semibold text-lg whitespace-nowrap">{booking.daysToGo}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Pill icon={Calendar} label={booking.date} />
          <Pill icon={ClockIcon} label={booking.time} />
          <Pill icon={MapPin} label={booking.city} />
        </div>

        <hr className="border-[var(--lighttext)]" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-2xl font-medium text-[var(--maincolor)]">{booking.price} · Paid</p>
          <div className="flex gap-4">
            <button
              onClick={() => onCancel(booking)}
              className="h-14 px-10 rounded-2xl border border-[#010170] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-[var(--maintaxt)] font-medium text-lg"
            >
              Cancel
            </button>
            <button className="h-14 px-10 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-medium text-lg flex items-center gap-2">
              Message guide <MessageCircle className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PastCard({ booking }) {
  return (
    <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[8px_8px_24px_0px_rgba(1,1,112,0.15)] px-8 md:px-12 py-8 flex-1 min-w-[320px]">
      <div className="flex flex-col gap-10">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-8">
            <p className="text-[var(--secondarycolor)] font-semibold tracking-[1.4px] uppercase text-lg">Completed</p>
            <div className="flex flex-col gap-4">
              <p className="text-2xl font-medium text-[var(--maincolor)]">{booking.title}</p>
              <p className="text-xl text-[var(--mediumfont)]">with {booking.guide} · {booking.city}</p>
            </div>
          </div>
          <div className="bg-gradient-to-b from-[var(--maincolor)] to-[var(--maintaxt)] rounded-full size-[60px] flex items-center justify-center shrink-0">
            <Check className="size-6 text-white" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Pill icon={Calendar} label={booking.date} />
          <Pill icon={MapPin} label={booking.city} />
        </div>

        <hr className="border-[var(--lighttext)]" />

        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-medium text-[var(--maincolor)]">{booking.price}</p>
          <button className="h-14 px-10 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-medium text-lg flex items-center gap-2">
            Leave a review <Star className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function CancelledCard({ booking }) {
  return (
    <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[8px_8px_24px_0px_rgba(1,1,112,0.15)] px-8 md:px-12 py-8 flex-1 min-w-[320px]">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-[var(--darkfail,#ae1818)] font-semibold tracking-[1.4px] uppercase text-lg">Cancelled</p>
          <div className="flex flex-col gap-4">
            <p className="text-2xl font-medium text-[var(--maincolor)]">{booking.title}</p>
            <p className="text-xl text-[var(--mediumfont)]">with {booking.guide} · {booking.city}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Pill icon={Calendar} label={booking.date} />
          <Pill icon={XIcon} label={booking.reason} />
        </div>

        <hr className="border-[var(--lighttext)]" />

        <div className="bg-[rgba(237,200,76,0.05)] border border-[var(--lightgold)] rounded-2xl px-8 py-3 flex items-center gap-4">
          <Gift className="size-6 text-[var(--maincolor)]" />
          <p className="text-[var(--maincolor)] text-lg">Wallet credit {booking.credit}</p>
        </div>
      </div>
    </div>
  )
}

export default function BookingHistory() {
  const [tab, setTab] = useState('upcoming')
  const [cancelTarget, setCancelTarget] = useState(null)

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { key: 'past', label: 'Past tours', count: past.length },
    { key: 'cancelled', label: 'Cancelled', count: cancelled.length },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16 flex flex-col gap-16">
        <AccountTabs />

        <div className="flex justify-center w-full">
          <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[0px_4px_12px_0px_rgba(1,1,112,0.2)] p-4 inline-flex flex-wrap gap-2">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-2xl px-6 py-5 text-xl font-medium whitespace-nowrap ${
                  tab === key ? 'bg-[var(--maincolor)] text-white' : 'bg-white text-[var(--maincolor)]'
                }`}
              >
                {label}
                <span
                  className={`size-9 rounded-full flex items-center justify-center text-base font-medium ${
                    tab === key
                      ? 'bg-[var(--secondarycolor)] text-white'
                      : 'bg-[var(--lightblue)] text-[var(--maincolor)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full">
          {tab === 'upcoming' &&
            upcoming.map((b) =>
              b.isToday ? (
                <TodayCard key={b.id} booking={b} />
              ) : (
                <div key={b.id} className="flex flex-wrap gap-6">
                  <UpcomingCard booking={b} onCancel={setCancelTarget} />
                </div>
              )
            )}
          {tab === 'past' && (
            <div className="flex flex-wrap gap-6">
              {past.map((b) => (
                <PastCard key={b.id} booking={b} />
              ))}
            </div>
          )}
          {tab === 'cancelled' && (
            <div className="flex flex-wrap gap-6">
              {cancelled.map((b) => (
                <CancelledCard key={b.id} booking={b} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CancelModal
        booking={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => setCancelTarget(null)}
      />
    </div>
  )
}
