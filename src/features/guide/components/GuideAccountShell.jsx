import { BadgeCheck, Clock3, UserRound, WalletCards } from "lucide-react";
import { NavLink } from "react-router-dom";

import GuideNavbar from "@/components/home/GuideNavbar.jsx";

const ACCOUNT_LINKS = [
  { label: "Profile & Settings", to: "/guide/settings", icon: UserRound },
  {
    label: "Complete profile",
    to: "/guide/complete-profile",
    icon: BadgeCheck,
  },
  { label: "Booking history", to: "/guide/bookings", icon: Clock3 },
  { label: "Earnings", to: "/guide/earnings", icon: WalletCards },
];

export default function GuideAccountShell({ children }) {
  return (
    <div className="min-h-screen bg-[#FDFDFF] text-[#010138]">
      <GuideNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <nav
          aria-label="Guide account"
          className="overflow-x-auto rounded-2xl border border-[#d7d6e8] bg-white p-2 shadow-[0_10px_28px_rgba(1,1,56,0.10)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="grid min-w-[760px] grid-cols-4 gap-2">
            {ACCOUNT_LINKS.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex h-14 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition lg:text-base ${
                    isActive
                      ? "bg-[#07078c] text-white shadow-[0_6px_18px_rgba(1,1,112,0.24)]"
                      : "text-[#010138] hover:bg-[#f2f1f8]"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mt-10">{children}</div>
      </main>
    </div>
  );
}
