import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { touristApi } from "@/features/touristVerification/api/touristApi";
import { Clock, MapPin, XCircle } from "lucide-react";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchBookings = () => {
    setLoading(true);
    touristApi.getMyBookings()
      .then((res) => {
        const raw = Array.isArray(res) ? res : res?.bookings ?? res?.data ?? [];
        setBookings(raw);
      })
      .catch((err) => setError(err.message || "Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(bookingId);
    setMsg({ type: "", text: "" });
    try {
      await touristApi.cancelBooking(bookingId, "Cancelled by tourist");
      setMsg({ type: "success", text: "Booking cancelled." });
      fetchBookings();
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Cancellation failed." });
    } finally {
      setCancelling(null);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      confirmed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
    };
    const s = styles[status] || styles.pending;
    return <span className={`rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold ${s}`}>{status}</span>;
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f3f2fa] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#f3f2fa]">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#100f45]">My Bookings</h1>
            <p className="text-xs sm:text-sm text-[#5d5b84] mt-1">Manage your tour bookings</p>
          </div>
          <Link to="/tours"
            className="rounded-full bg-[#1d1a7d] px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white">
            Browse Tours
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-600 mb-4">{error}</div>
        )}

        {msg.text && (
          <p className={`mb-4 rounded-xl border px-3 sm:px-4 py-2 text-xs sm:text-sm ${msg.type === "error" ? "border-[#efc2c2] bg-[#fff2f2] text-[#a12121]" : "border-[#bedfb8] bg-[#eefce9] text-[#1f6a21]"}`}>
            {msg.text}
          </p>
        )}

        {bookings.length === 0 && !error ? (
          <div className="rounded-xl border border-[#dddced] bg-white p-8 text-center">
            <p className="text-sm text-[#5d5b84]">No bookings yet.</p>
            <Link to="/tours" className="inline-block mt-3 rounded-full bg-[#1d1a7d] px-5 py-2 text-xs font-semibold text-white">
              Discover Tours
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {bookings.map((booking) => {
              const bId = booking._id || booking.id;
              const tour = booking.tour || {};
              const tourId = tour._id || tour.id;
              const title = tour.title || "Tour";
              const img = tour.coverImage?.secureUrl || "";
              const dest = tour.destination || "";
              const slot = booking.slot || {};
              const date = slot.date ? new Date(slot.date).toLocaleDateString() : "";
              const status = booking.status || "pending";
              const price = booking.totalPrice || booking.price || 0;
              const groupType = booking.groupType || "";

              return (
                <div key={bId} className="rounded-xl sm:rounded-2xl border border-[#dddced] bg-white overflow-hidden shadow-sm">
                  <div className="flex flex-col sm:flex-row">
                    {img && (
                      <div className="sm:w-40 lg:w-48 h-32 sm:h-auto bg-[#f4f4f8] shrink-0">
                        <img src={img} alt={title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-3 sm:p-4 lg:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/tours/${tourId}`} className="text-sm sm:text-base font-semibold text-[#100f45] hover:underline">{title}</Link>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] sm:text-xs text-[#5d5b84]">
                            {dest && <span className="flex items-center gap-1"><MapPin size={12} />{dest}</span>}
                            {date && <span className="flex items-center gap-1"><Clock size={12} />{date}</span>}
                            {groupType && <span>{groupLabels[groupType] || groupType}</span>}
                          </div>
                        </div>
                        {statusBadge(status)}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#eeeef2]">
                        <span className="text-xs sm:text-sm font-bold text-[#010170]">${price} USD</span>
                        {(status === "confirmed" || status === "pending") && (
                          <button onClick={() => handleCancel(bId)} disabled={cancelling === bId}
                            className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] sm:text-xs font-semibold text-red-600 disabled:opacity-50">
                            <XCircle size={12} /> {cancelling === bId ? "..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const groupLabels = { PRIVATE: "Private", SMALL_GROUP: "Small Group", LARGE_GROUP: "Large Group" };
