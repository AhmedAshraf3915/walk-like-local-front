import { useState, useMemo } from 'react'
import Navbar from "@/components/home/Navbar.jsx";
import CheckoutReviewModal from '../components/CheckoutReviewModal'
import { MapPin, Clock as ClockIcon, Languages, Star, Lock, Check } from 'lucide-react'

// Replace with your own <Footer /> component import
const Footer = () => null

const tags = ['Food', 'Bazzar', 'Historical']

const gallery = [
  'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=500&h=700&fit=crop',
  'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1554072675-66db59dba46f?w=400&h=400&fit=crop',
]

const packages = [
  { id: 'private', guests: '1 guest', label: 'Private', price: 30 },
  { id: 'small', guests: '2-4 guests', label: 'Small group', price: 50 },
  { id: 'large', guests: '5-8 guests', label: 'Large group', price: 60 },
]

const activities = [
  {
    id: 1,
    title: 'Guided Architectural Walk of Al-Muizz Street',
    desc: "Walk through history along Al-Muizz Street, home to the world's densest and most spectacular collection of medieval Islamic masonry, mosques, and soaring minarets.",
    locked: true,
    price: '+ $85',
    note: 'Private',
  },
  {
    id: 2,
    title: 'El-Fishawy Café Cultural Immersion',
    desc: "Savor authentic Egyptian mint tea or dark Arabic coffee at Cairo's most famous historic café, surrounded by ornate vintage mirrors and 200 years of artistic heritage.",
    locked: false,
    included: true,
    note: 'Private',
  },
  {
    id: 3,
    title: 'Guided Architectural Walk of Al-Muizz Street',
    desc: "Walk through history along Al-Muizz Street, home to the world's densest and most spectacular collection of medieval Islamic masonry, mosques, and soaring minarets.",
    locked: true,
    price: '+ $85',
    note: 'Private',
  },
]

const timeSlots = [
  { id: 1, day: 'TUE', date: 'Jun 14', time: '09:00 - 12:00', status: 'selected' },
  { id: 2, day: 'TUE', date: 'Jun 14', time: '13:00 - 15:00', status: 'unavailable' },
  { id: 3, day: 'TUE', date: 'Jun 14', time: '15:00 - 17:00', status: 'unavailable' },
  { id: 4, day: 'WED', date: 'Jun 15', time: '15:00 - 17:00', status: 'available' },
  { id: 5, day: 'WED', date: 'Jun 15', time: '18:00 - 20:00', status: 'available' },
  { id: 6, day: 'THU', date: 'Jun 16', time: '08:00 - 10:00', status: 'available' },
  { id: 7, day: 'THU', date: 'Jun 16', time: '10:00 - 12:00', status: 'available' },
  { id: 8, day: 'THU', date: 'Jun 16', time: '13:00 - 15:00', status: 'available' },
]

function StatItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <Icon className="size-9 text-[var(--maincolor)] shrink-0" />
      <div className="flex flex-col gap-2">
        <p className="text-base text-[var(--lighttext)] tracking-[3px] uppercase">{label}</p>
        <p className="font-semibold text-2xl text-[var(--maincolor)]">{value}</p>
      </div>
    </div>
  )
}

function PackageCard({ pkg, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(pkg.id)}
      className={`flex-1 min-w-[220px] text-left rounded-2xl border p-5 transition-colors ${
        active
          ? 'bg-[var(--maincolor)] border-[var(--lighttext)] shadow-[-8px_8px_24px_0px_rgba(1,1,56,0.25)]'
          : 'bg-white border-[var(--lighttext)]'
      }`}
    >
      <div className="flex gap-8 items-start">
        <div className="flex flex-col gap-2 flex-1">
          <p className={`text-base tracking-[2.7px] uppercase ${active ? 'text-[var(--lightblue)]' : 'text-[var(--lighttext)]'}`}>
            {pkg.guests}
          </p>
          <p className={`text-xl font-medium ${active ? 'text-white' : 'text-[var(--maincolor)]'}`}>{pkg.label}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className={`text-base ${active ? 'text-[var(--lightblue)]' : 'text-[var(--lighttext)]'}`}>From</p>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className={`text-xl font-medium ${active ? 'text-[var(--secondarycolor)]' : 'text-[var(--maincolor)]'}`}>
              ${pkg.price}
            </span>
            <span className={`text-sm ${active ? 'text-[var(--lightblue)]' : 'text-[var(--lighttext)]'}`}>USD</span>
          </div>
        </div>
      </div>
    </button>
  )
}

function ActivityRow({ activity, enabled, onToggle, isFirst, isLast }) {
  return (
    <div
      className={`bg-white p-6 w-full flex items-center justify-between gap-2 ${
        !isLast ? 'border-b border-[var(--lighttext)]' : ''
      } ${isFirst ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl' : ''}`}
    >
      <div className="flex gap-6 items-center flex-1">
        <button
          disabled={activity.locked}
          onClick={() => onToggle(activity.id)}
          className={`shrink-0 size-[30px] rounded-2xl flex items-center justify-center ${
            activity.locked
              ? 'bg-[var(--maincolor)]'
              : enabled
              ? 'bg-[var(--maincolor)] border-[1.5px] border-[var(--maincolor)]'
              : 'border-[1.5px] border-[var(--maincolor)]'
          }`}
        >
          {(activity.locked || enabled) && <Lock className="size-4 text-white" />}
        </button>
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xl font-medium text-[var(--maincolor)]">{activity.title}</p>
          <p className="text-lg text-[var(--mediumfont)]">{activity.desc}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center text-center shrink-0 w-[110px]">
        {activity.included ? (
          <span className="bg-[rgba(123,224,0,0.15)] text-[var(--darksuccess,#396504)] rounded-full px-5 py-1 text-base font-medium">
            Included
          </span>
        ) : (
          <span className="text-lg font-medium text-[var(--maincolor)]">{activity.price}</span>
        )}
        <span className="text-base font-medium text-[var(--mediumfont)]">{activity.note}</span>
      </div>
    </div>
  )
}

function SlotCard({ slot, onSelect }) {
  const base = 'flex-1 min-w-[150px] rounded-2xl border px-5 py-5 flex flex-col gap-2 text-center cursor-pointer'
  if (slot.status === 'selected') {
    return (
      <div
        onClick={() => onSelect(slot.id)}
        className={`${base} bg-[var(--maincolor)] border-[var(--lighttext)] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)]`}
      >
        <p className="text-base text-[var(--lightblue)] tracking-[2.7px] uppercase">{slot.day}</p>
        <p className="text-lg font-medium text-white">{slot.date}</p>
        <p className="text-base font-medium text-[var(--lightblue)]">{slot.time}</p>
      </div>
    )
  }
  if (slot.status === 'unavailable') {
    return (
      <div className={`${base} bg-[#eeeef0] border-[var(--lighttext)] cursor-not-allowed`}>
        <p className="text-base text-[var(--mediumfont)] tracking-[2.7px] uppercase">{slot.day}</p>
        <p className="text-lg font-medium text-[var(--maintaxt)]">{slot.date}</p>
        <p className="text-base font-medium text-[var(--mediumfont)] line-through">{slot.time}</p>
      </div>
    )
  }
  return (
    <div onClick={() => onSelect(slot.id)} className={`${base} bg-white border-[var(--lighttext)] hover:border-[var(--maincolor)]`}>
      <p className="text-base text-[var(--mediumfont)] tracking-[2.7px] uppercase">{slot.day}</p>
      <p className="text-lg font-medium text-[var(--maintaxt)]">{slot.date}</p>
      <p className="text-base font-medium text-[var(--mediumfont)]">{slot.time}</p>
    </div>
  )
}

export default function TourDetail() {
  const [selectedPackage, setSelectedPackage] = useState('private')
  const [enabledActivities, setEnabledActivities] = useState({ 2: true })
  const [slots, setSlots] = useState(timeSlots)
  const [showReview, setShowReview] = useState(false)

  const toggleActivity = (id) => setEnabledActivities((prev) => ({ ...prev, [id]: !prev[id] }))

  const selectSlot = (id) =>
    setSlots((prev) =>
      prev.map((s) =>
        s.id === id && s.status !== 'unavailable'
          ? { ...s, status: 'selected' }
          : s.status === 'selected'
          ? { ...s, status: 'available' }
          : s
      )
    )

  const pkg = packages.find((p) => p.id === selectedPackage)
  const activitiesTotal = useMemo(
    () =>
      activities
        .filter((a) => a.locked || enabledActivities[a.id])
        .reduce((sum, a) => sum + (a.included ? 0 : 85), 0),
    [enabledActivities]
  )
  const tourBase = 320
  const total = tourBase + activitiesTotal
  const selectedSlot = slots.find((s) => s.status === 'selected')

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-[1920px] mx-auto px-8 lg:px-24 py-12 flex flex-col gap-22">
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Left column */}
          <div className="flex flex-col gap-12 flex-1 w-full">
            <div className="flex flex-wrap gap-6">
              {tags.map((t) => (
                <span key={t} className="bg-[rgba(1,1,112,0.15)] text-[var(--maincolor)] rounded-full px-8 py-2 text-xl font-medium">
                  {t}
                </span>
              ))}
            </div>

            {/* Gallery */}
            <div className="flex flex-col sm:flex-row gap-6 w-full">
              <img src={gallery[0]} alt="" className="rounded-2xl object-cover w-full sm:w-[40%] h-[300px] sm:h-[500px]" />
              <div className="grid grid-cols-2 gap-6 flex-1">
                {gallery.slice(1).map((src, i) => (
                  <img key={i} src={src} alt="" className="rounded-2xl object-cover w-full h-[240px]" />
                ))}
              </div>
            </div>

            {/* Title + description */}
            <div className="flex flex-col gap-6">
              <h1 className="font-semibold text-3xl md:text-4xl text-[var(--maintaxt)]">
                The Soul of Old Cairo: Private Khan El-Khalili &amp; Historic Al-Muizz Expedition
              </h1>
              <p className="text-xl md:text-2xl text-[var(--mediumfont)] leading-relaxed">
                Explore the vibrant heart of Old Cairo on a premium guided journey through legendary 14th-century alleyways.
                <br />
                <br />
                Discover hidden artisan workshops, sensory spice markets, and timeless monuments tucked away in Cairo&apos;s historic trading hub.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-10">
              <StatItem icon={MapPin} label="Meeting point" value="Egypt , Cairo" />
              <StatItem icon={ClockIcon} label="duration" value="3 hours" />
              <StatItem icon={Languages} label="languages" value="EN, FR" />
            </div>

            {/* Guide */}
            <div className="border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] px-6 md:px-8 py-6 w-full">
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <div className="flex flex-col gap-3 items-center shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop"
                    alt="guide"
                    className="size-[110px] rounded-full object-cover"
                  />
                  <p className="font-semibold text-xl text-[var(--maintaxt)]">Karim A</p>
                </div>
                <div className="flex flex-col gap-4 flex-1 w-full">
                  <div className="flex flex-wrap gap-10">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Star className="size-6 text-[var(--maincolor)] fill-current" />
                        <span className="text-xl font-medium text-[var(--maincolor)]">4.9</span>
                      </div>
                      <p className="text-sm tracking-[2.4px] uppercase text-[var(--mediumfont)]">Guide rating</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xl font-medium text-[var(--maincolor)]">40</p>
                      <p className="text-sm tracking-[2.4px] uppercase text-[var(--mediumfont)]">total tours</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xl font-medium text-[var(--maincolor)]">120</p>
                      <p className="text-sm tracking-[2.4px] uppercase text-[var(--mediumfont)]">reviews</p>
                    </div>
                  </div>
                  <p className="text-lg text-[var(--maintaxt)]">
                    My name is Sóla. I am born here in Iceland. I love to hike up in the mountains, watch the birds in the summer time and swim in our geothermal swimming pools the whole year around. I studied....
                  </p>
                  <button className="self-start h-12 px-8 rounded-2xl border border-[#010170] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-[var(--maintaxt)] font-medium text-lg">
                    view guide profile
                  </button>
                </div>
              </div>
            </div>

            {/* Packages */}
            <div className="flex flex-col gap-8 w-full">
              <h2 className="font-semibold text-2xl text-[var(--maintaxt)]">Choose your package</h2>
              <div className="flex flex-wrap gap-6">
                {packages.map((p) => (
                  <PackageCard key={p.id} pkg={p} active={selectedPackage === p.id} onSelect={setSelectedPackage} />
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="flex flex-col gap-8 w-full">
              <div className="flex flex-col gap-4">
                <h2 className="font-semibold text-2xl text-[var(--maintaxt)]">Included activities</h2>
                <p className="text-xl text-[var(--maincolor)]">
                  Opt out of removable items; locked items are part of the core experience.
                </p>
              </div>
              <div className="border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] overflow-hidden w-full">
                {activities.map((a, i) => (
                  <ActivityRow
                    key={a.id}
                    activity={a}
                    enabled={!!enabledActivities[a.id]}
                    onToggle={toggleActivity}
                    isFirst={i === 0}
                    isLast={i === activities.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Time slots */}
            <div className="flex flex-col gap-8 w-full">
              <div className="flex flex-col gap-4">
                <h2 className="font-semibold text-2xl text-[var(--maintaxt)]">Available time slots</h2>
                <p className="text-xl text-[var(--maincolor)]">
                  Pick a window. Booked slots return to availability if the guide cancels.
                </p>
              </div>
              <div className="flex flex-col gap-6 w-full items-center">
                <div className="flex flex-wrap gap-8">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-full bg-[var(--maincolor)]" />
                    <span className="text-lg text-[var(--maincolor)]">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-full bg-white border border-[var(--lighttext)]" />
                    <span className="text-lg text-[var(--maincolor)]">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-full bg-[#eeeef0]" />
                    <span className="text-lg text-[var(--maincolor)]">Unavailable</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 w-full">
                  {slots.map((s) => (
                    <SlotCard key={s.id} slot={s} onSelect={selectSlot} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column - live receipt */}
          <div className="flex flex-col gap-8 w-full lg:w-[420px] shrink-0 lg:sticky lg:top-8">
            <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] px-8 py-10 w-full">
              <div className="flex flex-col gap-10">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-[var(--mediumfont)] tracking-[3.6px] uppercase">Live receipt</p>
                  <span className="bg-[rgba(1,1,112,0.05)] text-[var(--mediumfont)] rounded-full px-6 py-2 text-base font-medium">
                    Editable
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-end gap-2 text-[var(--maincolor)]">
                    <p className="font-semibold text-3xl">${total}</p>
                    <p className="text-lg">Total . {pkg.label}</p>
                  </div>
                  <div className="flex flex-col gap-4 text-lg text-[var(--maintaxt)]">
                    <div className="flex items-center justify-between">
                      <p>Tour base . {pkg.label}</p>
                      <p>${tourBase}</p>
                    </div>
                    {activities
                      .filter((a) => a.locked || enabledActivities[a.id])
                      .map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-[var(--maincolor)]">
                          <p>{a.title}</p>
                          <p>{a.included ? 'Included' : '$85'}</p>
                        </div>
                      ))}
                  </div>
                </div>

                <hr className="border-[var(--lighttext)]" />

                <div className="flex items-center justify-between text-lg text-[var(--maintaxt)]">
                  <p>Activities subtotal</p>
                  <p>${activitiesTotal}</p>
                </div>

                <div className="bg-[rgba(204,204,226,0.2)] rounded-2xl px-4 py-3">
                  <p className="text-base text-[var(--maincolor)]">
                    <span className="font-medium">Formula</span> · Tour Base ({pkg.label}) + Σ selected activities ({pkg.label})
                  </p>
                </div>

                <div className="flex flex-col gap-3 items-center">
                  <button
                    onClick={() => setShowReview(true)}
                    className="h-14 px-10 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-semibold text-lg w-full"
                  >
                    Proceed to booking
                  </button>
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-[var(--maincolor)]" />
                    <p className="text-sm font-light text-[var(--maincolor)]">Secure instant booking · Stripe</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Check className="size-10 text-[var(--darkgold)] shrink-0" />
              <div className="flex flex-col gap-2">
                <a
                  href="https://www.toursbylocals.com/policy/toursbylocals-cancellation-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-lg font-medium text-[var(--darkgold)] underline"
                >
                  View our cancellation policies
                </a>
                <p className="text-base text-[rgba(135,114,43,0.7)]">
                  Upgrade for total flexibility with Any Reason Cancellation
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showReview && (
        <CheckoutReviewModal
          onClose={() => setShowReview(false)}
          onBack={() => setShowReview(false)}
          onContinue={() => setShowReview(false)}
          summary={{
            package: pkg.label,
            guestsNote: pkg.guests === '1 guest' ? 'Strictly 1 guest' : pkg.guests,
            price: `$${tourBase}`,
            activities: activities
              .filter((a) => a.locked || enabledActivities[a.id])
              .map((a) => ({ name: a.title, price: a.included ? 'Included' : '$85' })),
            date: selectedSlot ? `${selectedSlot.day} . ${selectedSlot.date}` : '—',
            time: selectedSlot?.time || '—',
            total: `$${total}`,
          }}
        />
      )}
    </div>
  )
}
