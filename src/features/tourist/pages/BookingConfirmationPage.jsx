import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { touristApi } from "@/features/touristVerification/api/touristApi";
import { CheckCircle } from "lucide-react";

export default function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    touristApi.getPaymentStatus(bookingId)
      .then((data) => setPaymentStatus(data?.status || data?.paymentStatus || null))
      .catch(() => { /* not critical */ })
      .finally(() => setLoading(false));
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-[#f3f2fa] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl sm:rounded-2xl border border-[#dddced] bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(32,30,88,0.08)] text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle size={28} className="text-green-600" />
        </div>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#100f45] mt-4">Booking Confirmed!</h1>
        <p className="text-xs sm:text-sm text-[#5d5b84] mt-2">
          Your booking has been created. {paymentStatus === "paid" ? "Payment was successful." : "Complete payment to secure your spot."}
        </p>
        {loading && <div className="w-5 h-5 border-3 border-[#010170] border-t-transparent rounded-full animate-spin mx-auto mt-3" />}
        <div className="flex flex-col gap-2 mt-6">
          <Link to="/tourist/bookings" className="rounded-xl bg-[#1d1a7d] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white">
            View My Bookings
          </Link>
          <Link to="/tours" className="rounded-xl border border-[#cfcee6] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#323166]">
            Browse More Tours
          </Link>
        </div>
      </div>
    </div>
  );
}
