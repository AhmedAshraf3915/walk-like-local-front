import { BadgeCheck, Clock3, WalletCards } from "lucide-react";
import { NavLink } from "react-router-dom";

import GuideNavbar from "@/components/home/GuideNavbar.jsx";

const ACCOUNT_LINKS = [
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
          className="rounded-3xl border border-[#d9d8ea] bg-[linear-gradient(160deg,#ffffff_0%,#f8f8ff_100%)] p-2.5 shadow-[0_14px_36px_rgba(1,1,56,0.11)]"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {ACCOUNT_LINKS.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group flex h-14 items-center justify-center gap-2.5 rounded-2xl px-4 text-sm font-semibold transition duration-200 lg:text-base ${
                    isActive
                      ? "bg-gradient-to-r from-[#090993] via-[#1414a5] to-[#2d2db5] text-white shadow-[0_10px_24px_rgba(6,6,132,0.34)]"
                      : "text-[#19185a] hover:bg-[#efeff9] hover:text-[#07078c]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full transition ${
                        isActive
                          ? "bg-white/16"
                          : "bg-[#e9eafb] group-hover:bg-[#dfe0f7]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mt-10">{children}</div>
      </main>
    </div>
  );
}
