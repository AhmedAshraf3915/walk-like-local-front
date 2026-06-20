import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import { touristApi } from "@/features/touristVerification/api/touristApi";
import useAuth from "@/contexts/useAuth";
import { ArrowLeft, MapPin, Clock, Users, Star } from "lucide-react";

export default function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedGroupType, setSelectedGroupType] = useState("");
  const [booking, setBooking] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/tours/${id}`)
      .then((res) => {
        const data = unwrap(res);
        setTour(data);
        if (data.slots?.length > 0) setSelectedSlot(data.slots[0]._id || data.slots[0].id || "");
        const pricing = data.pricing || {};
        const keys = Object.keys(pricing).filter((k) => pricing[k] > 0);
        if (keys.length > 0) setSelectedGroupType(keys[0]);
      })
      .catch((err) => setError(err.message || "Failed to load tour"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=" + encodeURIComponent(`/tours/${id}`));
      return;
    }
    if (String(userRole).toLowerCase() !== "tourist") {
      setMsg({ type: "error", text: "Only tourists can book tours." });
      return;
    }
    if (!selectedSlot) {
      setMsg({ type: "error", text: "Please select an available slot." });
      return;
    }
    setBooking(true);
    setMsg({ type: "", text: "" });
    try {
      const result = await touristApi.createBooking({
        tour: id,
        slot: selectedSlot,
        groupType: selectedGroupType || undefined,
      });
      const bookingId = result?.booking?._id || result?.booking?.id || result?._id || result?.id;
      if (bookingId) {
        navigate(`/tourist/bookings/${bookingId}/confirmation`);
      } else {
        setMsg({ type: "success", text: "Booking created! Redirecting..." });
      }
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Booking failed." });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f3f2fa] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-[#f3f2fa] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <Link to="/tours" className="text-xs text-[#010170] underline">Back to tours</Link>
      </div>
    </div>;
  }

  if (!tour) return null;

  const pricing = tour.pricing || {};
  const priceKeys = Object.keys(pricing).filter((k) => pricing[k] > 0);
  const groupLabels = { PRIVATE: "Private", SMALL_GROUP: "Small Group", LARGE_GROUP: "Large Group" };
  const coverImg = tour.coverImage?.secureUrl || "";
  const guideName = tour.guide?.fullName || tour.guide?.name || "Local Guide";
  const guidePhoto = tour.guide?.profilePhoto?.secureUrl || "";
  const rating = tour.rating || 0;

  return (
    <div className="min-h-screen bg-[#f3f2fa]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
        <Link to="/tours" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#5d5b84] hover:text-[#010170] mb-4">
          <ArrowLeft size={14} /> Back to tours
        </Link>

        <div className="rounded-xl sm:rounded-2xl border border-[#dddced] bg-white overflow-hidden shadow-[0_20px_50px_rgba(32,30,88,0.08)]">
          {coverImg && (
            <div className="aspect-[2/1] sm:aspect-[3/1] bg-[#f4f4f8] overflow-hidden">
              <img src={coverImg} alt={tour.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#100f45]">{tour.title}</h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-[#5d5b84]">
                {tour.destination && <span className="flex items-center gap-1"><MapPin size={14} />{tour.destination}</span>}
                {tour.duration && <span className="flex items-center gap-1"><Clock size={14} />{tour.duration}</span>}
                {tour.meetingPoint && <span className="flex items-center gap-1"><MapPin size={14} />Meet: {tour.meetingPoint}</span>}
                {rating > 0 && <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" />{rating}</span>}
              </div>
            </div>

            {tour.description && (
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-[#23225e] mb-1.5">About</h2>
                <p className="text-xs sm:text-sm text-[#5d5b84] leading-relaxed">{tour.description}</p>
              </div>
            )}

            {guideName && (
              <div className="flex items-center gap-3 rounded-xl bg-[#f4f4f8] px-4 py-3">
                {guidePhoto ? <img src={guidePhoto} alt={guideName} className="w-10 h-10 rounded-full object-cover" />
                  : <div className="w-10 h-10 rounded-full bg-[#aaaacf] flex items-center justify-center text-white text-xs">{guideName[0]}</div>}
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#100f45]">{guideName}</p>
                  <p className="text-[10px] sm:text-xs text-[#5d5b84]">Your guide</p>
                </div>
              </div>
            )}

            {priceKeys.length > 0 && (
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-[#23225e] mb-2">Pricing</h2>
                <div className="flex flex-wrap gap-2">
                  {priceKeys.map((key) => (
                    <button key={key} onClick={() => setSelectedGroupType(key)}
                      className={`rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold transition ${selectedGroupType === key ? "border-[#1f1c83] bg-[#1f1c83] text-white" : "border-[#cbc9e4] bg-white text-[#403e6b]"}`}>
                      {groupLabels[key] || key}: ${pricing[key]} USD
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tour.activities?.length > 0 && (
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-[#23225e] mb-2">Activities</h2>
                <div className="space-y-2">
                  {tour.activities.map((act, i) => (
                    <div key={i} className="rounded-lg border border-[#d5d4ea] bg-[#fcfcff] px-3 sm:px-4 py-2 sm:py-3">
                      <p className="text-xs sm:text-sm font-medium text-[#100f45]">{act.name}</p>
                      {act.description && <p className="text-[10px] sm:text-xs text-[#5d5b84] mt-0.5">{act.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tour.slots?.length > 0 && (
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-[#23225e] mb-2">Available Slots</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {tour.slots.map((slot) => {
                    const slotId = slot._id || slot.id;
                    const date = slot.date ? new Date(slot.date).toLocaleDateString() : "";
                    return (
                      <button key={slotId} onClick={() => setSelectedSlot(slotId)}
                        className={`rounded-lg border px-3 py-2.5 text-left text-xs sm:text-sm transition ${selectedSlot === slotId ? "border-[#1f1c83] bg-[#edeefe]" : "border-[#d5d4ea] bg-white hover:bg-[#f4f4f8]"}`}>
                        <span className="font-medium text-[#100f45]">{date || slot.date}</span>
                        {slot.startTime && <span className="text-[#5d5b84] ml-2">{slot.startTime} - {slot.endTime || ""}</span>}
                        {slot.maxParticipants && <span className="flex items-center gap-1 text-[#5d5b84] mt-1"><Users size={12} /> {slot.maxParticipants} spots</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {msg.text && (
              <p className={`rounded-xl border px-3 sm:px-4 py-2 text-xs sm:text-sm ${msg.type === "error" ? "border-[#efc2c2] bg-[#fff2f2] text-[#a12121]" : "border-[#bedfb8] bg-[#eefce9] text-[#1f6a21]"}`}>
                {msg.text}
              </p>
            )}

            <button onClick={handleBook} disabled={booking || !selectedSlot}
              className="w-full rounded-xl bg-gradient-to-r from-[#010170] to-[#5656a0] px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white disabled:opacity-60">
              {booking ? "Processing..." : isAuthenticated ? "Book This Tour" : "Log in to Book"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
