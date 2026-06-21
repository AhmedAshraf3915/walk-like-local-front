import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Gift,
  MapPin,
  Star,
  X,
} from "lucide-react";

import GuideAccountShell from "@/features/guide/components/GuideAccountShell";
import { guidesApi } from "@/features/guide/api/guidesApi";
import { mapGuideBookings } from "@/features/guide/utils/guideAccountMappers";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Past tours" },
  { key: "cancelled", label: "Cancelled" },
];

const CANCELLATION_REASONS = [
  "Schedule conflict",
  "Emergency situation",
  "Tour is no longer available",
  "Other",
];

const getDaysToGo = (date) => {
  if (!date) return "Upcoming";
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
  if (days <= 0) return "Today";
  return `${days} day${days === 1 ? "" : "s"} to go`;
};

function BookingMeta({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#d2d1e3] bg-[#fafafe] px-4 py-2 text-xs font-semibold text-[#24235f]">
      <Icon className="h-4 w-4" /> {children}
    </span>
  );
}

function BookingCard({ booking, onCancel }) {
  const isUpcoming = booking.status === "upcoming";
  const isCompleted = booking.status === "completed";

  return (
    <article className="rounded-3xl border border-[#d8d7e8] bg-white p-6 shadow-[0_12px_34px_rgba(1,1,56,0.10)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-[0.16em] ${
              booking.status === "cancelled"
                ? "text-[#ae1818]"
                : "text-[#c8a72f]"
            }`}
          >
            {booking.status === "cancelled"
              ? "Cancelled"
              : isCompleted
                ? "Completed"
                : "Confirmed"}
          </p>
          <h2 className="mt-4 text-xl font-bold">{booking.title}</h2>
          <p className="mt-2 text-sm text-[#65638a]">
            with {booking.touristName}
            {booking.touristLocation ? ` · ${booking.touristLocation}` : ""}
          </p>
        </div>
        {isUpcoming ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-[#07078c] px-4 py-2 text-xs font-semibold text-white">
            <Clock3 className="h-4 w-4" /> {getDaysToGo(booking.date)}
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <BookingMeta icon={CalendarDays}>{booking.dateLabel}</BookingMeta>
        {booking.status !== "cancelled" ? (
          <BookingMeta icon={Clock3}>{booking.time}</BookingMeta>
        ) : null}
        {booking.city ? (
          <BookingMeta icon={MapPin}>{booking.city}</BookingMeta>
        ) : null}
        {booking.status === "cancelled" && booking.cancelledBy ? (
          <BookingMeta icon={X}>{booking.cancelledBy} cancelled</BookingMeta>
        ) : null}
      </div>

      <div className="mt-6 border-t border-[#dfdeeb] pt-6">
        {isUpcoming ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-lg font-bold">
              {booking.total.toLocaleString("en-US", {
                style: "currency",
                currency: booking.currency,
              })}
              {booking.paymentStatus ? ` · ${booking.paymentStatus}` : ""}
            </p>
            <button
              type="button"
              onClick={() => onCancel(booking)}
              className="h-10 rounded-xl border border-[#9f9dbb] px-5 text-sm font-semibold text-[#010138] hover:bg-[#f5f4f9]"
            >
              Cancel booking
            </button>
          </div>
        ) : null}

        {isCompleted && booking.review ? (
          <div className="flex items-start justify-between gap-4">
            <p className="line-clamp-2 text-sm leading-6 text-[#353572]">
              {booking.review.comment ?? booking.review.text ?? ""}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold">
              <Star className="h-4 w-4 fill-[#EDC84C] text-[#EDC84C]" />
              {Number(booking.review.rating) || 0}/5
            </span>
          </div>
        ) : null}

        {booking.status === "cancelled" ? (
          <div className="rounded-xl border border-[#eadfb1] bg-[#fffdf4] px-4 py-3 text-sm text-[#61562b]">
            <Gift className="mr-2 inline h-4 w-4" />
            {booking.cancellationReason || "Booking cancelled"}
            {booking.refundAmount > 0
              ? ` · Refund ${booking.refundAmount.toLocaleString("en-US", {
                  style: "currency",
                  currency: booking.currency,
                })}`
              : ""}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function CancellationModal({ booking, onClose, onConfirmed }) {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const finalReason = reason === "Other" ? otherReason.trim() : reason;

  const confirm = async () => {
    if (!finalReason) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await guidesApi.cancelBooking(booking.id, finalReason);
      onConfirmed();
    } catch (error) {
      setErrorMessage(error?.message ?? "Unable to cancel this booking.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center overflow-y-auto bg-[#010138]/55 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-guide-booking-title"
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Close cancellation dialog"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#f0eff7]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-[#efb9b9] bg-[#fff2f2] px-4 py-3 text-center text-sm text-[#ae1818]">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          Cancelling an active booking can reduce your guide rating.
        </div>

        <h2
          id="cancel-guide-booking-title"
          className="mx-auto mt-6 max-w-md text-center text-2xl font-bold"
        >
          Why are you cancelling this booking?
        </h2>

        <div className="mt-6 space-y-3">
          {CANCELLATION_REASONS.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#deddec] px-4 py-3 text-sm font-semibold"
            >
              <input
                type="radio"
                name="cancellation-reason"
                value={option}
                checked={reason === option}
                onChange={(event) => setReason(event.target.value)}
                className="h-5 w-5 accent-[#07078c]"
              />
              {option}
            </label>
          ))}
        </div>

        {reason === "Other" ? (
          <textarea
            value={otherReason}
            onChange={(event) => setOtherReason(event.target.value)}
            placeholder="Tell us what happened"
            rows={3}
            className="mt-3 w-full rounded-xl border border-[#d8d7e8] px-4 py-3 text-sm outline-none focus:border-[#07078c]"
          />
        ) : null}

        {errorMessage ? (
          <p className="mt-4 text-sm text-[#ae1818]">{errorMessage}</p>
        ) : null}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl bg-gradient-to-r from-[#07078c] to-[#5656A0] text-sm font-semibold text-white"
          >
            Keep my booking
          </button>
          <button
            type="button"
            disabled={!finalReason || isSubmitting}
            onClick={confirm}
            className="h-11 rounded-xl border border-[#9f9dbb] text-sm font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Cancelling..." : "Confirm cancellation"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function GuideBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    guidesApi
      .getMyBookings({ page: 1, limit: 100 })
      .then((payload) => {
        if (!isMounted) return;
        setBookings(mapGuideBookings(payload));
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) return;
        setBookings([]);
        setErrorMessage(error?.message ?? "Unable to load guide bookings.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map(({ key }) => [
          key,
          bookings.filter((booking) => booking.status === key).length,
        ]),
      ),
    [bookings],
  );
  const visibleBookings = bookings.filter(
    (booking) => booking.status === activeTab,
  );

  return (
    <GuideAccountShell>
      <nav className="mx-auto grid max-w-2xl grid-cols-3 gap-2 rounded-2xl border border-[#d8d7e8] bg-white p-2 shadow-[0_10px_28px_rgba(1,1,56,0.10)]">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
              activeTab === key
                ? "bg-[#07078c] text-white"
                : "text-[#010138] hover:bg-[#f3f2f8]"
            }`}
          >
            {label}
            <span
              className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs ${
                activeTab === key
                  ? "bg-[#EDC84C] text-[#010138]"
                  : "bg-[#e4e3ef] text-[#353572]"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </nav>

      {errorMessage ? (
        <p className="mt-8 rounded-xl border border-[#efc2c2] bg-[#fff3f3] px-4 py-3 text-sm text-[#9f2626]">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-3xl bg-[#eeeeF6]" />
          ))}
        </div>
      ) : visibleBookings.length > 0 ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {visibleBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={setCancelTarget}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-[#c8c7d9] bg-[#fafafe] px-6 py-16 text-center text-sm text-[#65638a]">
          No {TABS.find((tab) => tab.key === activeTab)?.label.toLowerCase()} bookings.
        </div>
      )}

      {cancelTarget ? (
        <CancellationModal
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirmed={() => {
            setCancelTarget(null);
            setIsLoading(true);
            setReloadKey((current) => current + 1);
          }}
        />
      ) : null}
    </GuideAccountShell>
  );
}
