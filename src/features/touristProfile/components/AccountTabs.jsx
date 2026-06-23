import { Link, NavLink } from 'react-router-dom'
import { User, Clock } from 'lucide-react'

import {
  ArrowLeft
} from "lucide-react";

const tabs = [
  { to: '/tourist/profile', label: 'Profile & Settings', icon: User },
  { to: '/tourist/bookings', label: 'Booking history', icon: Clock },
]

export default function AccountTabs() {
  return (

    <div>
      {/* Back link */}
         <div className="text-center flex flex-col mt-0">
            <Link
              to="/"
              className="mb-4 inline-flex w-fit items-center gap-2 rounded-xl border border-[#d8d7e8] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--maincolor)] shadow-sm transition hover:border-[var(--maincolor)] hover:bg-[#f7f7fc]"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>

      <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(53,53,114,0.15)] p-4 w-full">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-xl font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--maincolor)] text-white'
                  : 'bg-white text-[var(--maincolor)] hover:bg-[var(--mediabackground)]'
              }`
            }
          >
            <Icon className="size-6" />
            {label}
          </NavLink>
        ))}
      </div>
    </div>

    </div>
  )
}
