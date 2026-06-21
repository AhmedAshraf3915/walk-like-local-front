import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarCheck2, CheckCircle2, WalletCards, XCircle } from "lucide-react";

import GuideAccountShell from "@/features/guide/components/GuideAccountShell";
import { guidesApi } from "@/features/guide/api/guidesApi";
import {
  mapGuideBookings,
  summarizeGuideBookings,
} from "@/features/guide/utils/guideAccountMappers";

const STAT_CARDS = [
  {
    key: "totalBookings",
    label: "Total bookings",
    caption: "All-time reservations",
    icon: CalendarCheck2,
    tone: "bg-[#ececf8] text-[#25257c]",
  },
  {
    key: "activeBookings",
    label: "Active bookings",
    caption: "Upcoming and ongoing tours",
    icon: Activity,
    tone: "bg-[#fff8df] text-[#87722b]",
  },
  {
    key: "completedBookings",
    label: "Completed bookings",
    caption: "Successfully delivered",
    icon: CheckCircle2,
    tone: "bg-[#eefbdc] text-[#41651f]",
  },
  {
    key: "cancelledBookings",
    label: "Cancelled bookings",
    caption: "Total cancellations",
    icon: XCircle,
    tone: "bg-[#ffe7e7] text-[#ae1818]",
  },
];

export default function GuideEarningsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    guidesApi
      .getMyBookings({ page: 1, limit: 100 })
      .then((payload) => {
        if (!isMounted) return;
        setBookings(mapGuideBookings(payload));
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error?.message ?? "Unable to load earnings data.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => summarizeGuideBookings(bookings), [bookings]);

  return (
    <GuideAccountShell>
      {errorMessage ? (
        <p className="mb-6 rounded-xl border border-[#efc2c2] bg-[#fff3f3] px-4 py-3 text-sm text-[#9f2626]">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-3xl bg-[#eeeeF6]" />
          <div className="grid gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-3xl bg-[#eeeeF6]" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <section className="flex items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-[#07078c] to-[#010138] px-6 py-9 text-white shadow-[0_16px_40px_rgba(1,1,112,0.24)] sm:px-10">
            <div>
              <p className="text-sm font-semibold text-white/70">Total earnings</p>
              <p className="mt-3 text-4xl font-bold">
                {summary.totalEarnings.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </p>
              <p className="mt-3 text-xs text-white/65">
                Calculated from paid and completed booking records.
              </p>
            </div>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#EDC84C] text-[#010138]">
              <WalletCards className="h-7 w-7" />
            </span>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAT_CARDS.map(({ key, label, caption, icon: Icon, tone }) => (
              <article
                key={key}
                className="rounded-3xl border border-[#d8d7e8] bg-white p-5 shadow-[0_10px_30px_rgba(1,1,56,0.10)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="max-w-36 text-sm font-bold uppercase tracking-[0.08em]">
                    {label}
                  </h2>
                  <span className={`grid h-12 w-12 place-items-center rounded-full ${tone}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                </div>
                <p className="mt-8 text-4xl font-bold">{summary[key]}</p>
                <p className="mt-8 text-xs font-medium text-[#aaaacf]">
                  {caption}
                </p>
              </article>
            ))}
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#c8c7d9] bg-[#fafafe] px-6 py-12 text-center text-sm text-[#65638a]">
              Earnings will appear after your first paid booking.
            </div>
          ) : null}
        </div>
      )}
    </GuideAccountShell>
  );
}
