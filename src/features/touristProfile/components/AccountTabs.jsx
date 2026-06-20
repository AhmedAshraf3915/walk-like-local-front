import { NavLink } from 'react-router-dom'
import { User, Clock, Wallet } from 'lucide-react'

const tabs = [
  { to: '/profile', label: 'Profile & Settings', icon: User },
  { to: '/bookings', label: 'Booking history', icon: Clock },
  { to: '/payments', label: 'Payments & Wallet', icon: Wallet },
]

export default function AccountTabs() {
  return (
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
  )
}
