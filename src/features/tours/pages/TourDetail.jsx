import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import { touristApi } from "@/features/touristVerification/api/touristApi";
import useAuth from "@/contexts/useAuth";
import Navbar from "@/components/home/Navbar.jsx";
import CheckoutReviewModal from "../../bookingTour/components/CheckoutReviewModal";
import { MapPin, Clock as ClockIcon, Languages, Star, Lock, Check, ArrowLeft } from "lucide-react";
import Footer from "@/components/home/Footer.jsx"; 
import { createCheckoutSession } from "../../touristProfile/services/Payments.js";


const GROUP_META = {
  PRIVATE: { label: "Private", guests: "1 guest", size: 1 },
  SMALL_GROUP: { label: "Small Group", guests: "2-4 guests", size: 2 },
  LARGE_GROUP: { label: "Large Group", guests: "5-8 guests", size: 5 },
};

function StatItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-4">
      <Icon className="size-9 text-[var(--maincolor)] shrink-0" />
      <div className="flex flex-col gap-2">
        <p className="text-base text-[var(--lighttext)] tracking-[3px] uppercase">{label}</p>
        <p className="font-semibold text-2xl text-[var(--maincolor)]">{value}</p>
      </div>
    </div>
  );
}

function PackageCard({ pkg, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(pkg.id)}
      className={`flex-1 min-w-[220px] text-left rounded-2xl border p-5 transition-colors ${
        active
          ? "bg-[var(--maincolor)] border-[var(--lighttext)] shadow-[-8px_8px_24px_0px_rgba(1,1,56,0.25)]"
          : "bg-white border-[var(--lighttext)]"
      }`}
    >
      <div className="flex gap-8 items-start">
        <div className="flex flex-col gap-2 flex-1">
          <p className={`text-base tracking-[2.7px] uppercase ${active ? "text-[var(--lightblue)]" : "text-[var(--lighttext)]"}`}>
            {pkg.guests}
          </p>
          <p className={`text-xl font-medium ${active ? "text-white" : "text-[var(--maincolor)]"}`}>{pkg.label}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className={`text-base ${active ? "text-[var(--lightblue)]" : "text-[var(--lighttext)]"}`}>From</p>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className={`text-xl font-medium ${active ? "text-[var(--secondarycolor)]" : "text-[var(--maincolor)]"}`}>
              ${pkg.price}
            </span>
            <span className={`text-sm ${active ? "text-[var(--lightblue)]" : "text-[var(--lighttext)]"}`}>USD</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ActivityRow({ activity, enabled, onToggle, isFirst, isLast }) {
  return (
    <div
      className={`bg-white p-6 w-full flex items-center justify-between gap-2 ${
        !isLast ? "border-b border-[var(--lighttext)]" : ""
      } ${isFirst ? "rounded-t-2xl" : ""} ${isLast ? "rounded-b-2xl" : ""}`}
    >
      <div className="flex gap-6 items-center flex-1">
        <button
          disabled={activity.locked}
          onClick={() => onToggle(activity.id)}
          className={`shrink-0 size-[30px] rounded-2xl flex items-center justify-center ${
            activity.locked
              ? "bg-[var(--maincolor)]"
              : enabled
              ? "bg-[var(--maincolor)] border-[1.5px] border-[var(--maincolor)]"
              : "border-[1.5px] border-[var(--maincolor)]"
          }`}
        >
          {(activity.locked || enabled) && <Lock className="size-4 text-white" />}
        </button>
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xl font-medium text-[var(--maincolor)]">{activity.title}</p>
          {activity.desc && <p className="text-lg text-[var(--mediumfont)]">{activity.desc}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center text-center shrink-0 w-[110px]">
        {activity.included ? (
          <span className="bg-[rgba(123,224,0,0.15)] text-[var(--darksuccess,#396504)] rounded-full px-5 py-1 text-base font-medium">
            Included
          </span>
        ) : (
          <span className="text-lg font-medium text-[var(--maincolor)]">${activity.price}</span>
        )}
        {activity.note && <span className="text-base font-medium text-[var(--mediumfont)]">{activity.note}</span>}
      </div>
    </div>
  );
}

function SlotCard({ slot, onSelect }) {
  const base = "flex-1 min-w-[150px] rounded-2xl border px-5 py-5 flex flex-col gap-2 text-center cursor-pointer";
  if (slot.status === "selected") {
    return (
      <div
        onClick={() => onSelect(slot.id)}
        className={`${base} bg-[var(--maincolor)] border-[var(--lighttext)] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)]`}
      >
        <p className="text-base text-[var(--lightblue)] tracking-[2.7px] uppercase">{slot.day}</p>
        <p className="text-lg font-medium text-white">{slot.date}</p>
        <p className="text-base font-medium text-[var(--lightblue)]">{slot.time}</p>
      </div>
    );
  }
  if (slot.status === "unavailable") {
    return (
      <div className={`${base} bg-[#eeeef0] border-[var(--lighttext)] cursor-not-allowed`}>
        <p className="text-base text-[var(--mediumfont)] tracking-[2.7px] uppercase">{slot.day}</p>
        <p className="text-lg font-medium text-[var(--maintaxt)]">{slot.date}</p>
        <p className="text-base font-medium text-[var(--mediumfont)] line-through">{slot.time}</p>
      </div>
    );
  }
  return (
    <div onClick={() => onSelect(slot.id)} className={`${base} bg-white border-[var(--lighttext)] hover:border-[var(--maincolor)]`}>
      <p className="text-base text-[var(--mediumfont)] tracking-[2.7px] uppercase">{slot.day}</p>
      <p className="text-lg font-medium text-[var(--maintaxt)]">{slot.date}</p>
      <p className="text-base font-medium text-[var(--mediumfont)]">{slot.time}</p>
    </div>
  );
}

function mapTour(data) {
  const pricing = data.pricing || {};
  const packages = Object.keys(GROUP_META)
    .filter((k) => pricing[k] > 0)
    .map((k) => ({ id: k, label: GROUP_META[k].label, guests: GROUP_META[k].guests, price: pricing[k] }));

  const gallery = [
    data.coverImage?.secureUrl,
    ...(Array.isArray(data.images) ? data.images.map((img) => img?.secureUrl) : []),
  ].filter(Boolean);

  const activities = (data.activities || []).map((act, i) => {
    const priceValue = Number(act.price) || 0;
    const included = act.included ?? priceValue === 0;
    return {
      id: act._id || act.id || String(i),
      title: act.name || act.title || "Activity",
      desc: act.description || "",
      included,
      locked: !!act.locked,
      price: priceValue,
      note: act.note || "",
    };
  });

  const slots = (data.slots || []).map((slot) => {
    const id = slot._id || slot.id;
    const d = slot.date ? new Date(slot.date) : null;
    return {
      id,
      day: d ? d.toLocaleDateString(undefined, { weekday: "short" }) : "",
      date: d ? d.toLocaleDateString() : slot.date || "",
      time: slot.startTime ? `${slot.startTime}${slot.endTime ? " - " + slot.endTime : ""}` : "",
      status: slot.available === false ? "unavailable" : "available",
    };
  });

  return {
    id: data._id || data.id,
    title: data.title || "",
    description: data.description || "",
    tags: data.categories || data.tags || [],
    meetingPoint: data.meetingPoint || data.destination || "",
    duration: data.duration || "",
    languages: Array.isArray(data.languages) ? data.languages.join(", ") : data.language || "",
    gallery,
    guide: {
      id: data.guide?._id || data.guide?.id || "", //  
      name: data.guide?.fullName || data.guide?.name || "Local Guide",
      photo: data.guide?.profilePhoto?.secureUrl || "",
      rating: data.guide?.rating || 0,
      totalTours: data.guide?.totalTours || 0,
      reviews: data.guide?.reviewsCount || data.guide?.reviews || 0,
      bio: data.guide?.bio || "",
    },
    packages,
    activities,
    slots,
  };
}

export default function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPackage, setSelectedPackage] = useState("");
  const [enabledActivities, setEnabledActivities] = useState({});
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [booking, setBooking] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get(`/tours/${id}`)
      .then((res) => {
        const mapped = mapTour(unwrap(res));
        setTour(mapped);
        if (mapped.packages.length > 0) setSelectedPackage(mapped.packages[0].id);
        const lockedDefaults = {};
        mapped.activities.forEach((a) => {
          if (a.locked || a.included) lockedDefaults[a.id] = true;
        });
        setEnabledActivities(lockedDefaults);
      })
      .catch((err) => setError(err.message || "Failed to load tour"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleActivity = (activityId) =>
    setEnabledActivities((prev) => ({ ...prev, [activityId]: !prev[activityId] }));

  const selectSlot = (slotId) => setSelectedSlotId((prev) => (prev === slotId ? null : slotId));

  const pkg = useMemo(
    () => tour?.packages.find((p) => p.id === selectedPackage) || null,
    [tour, selectedPackage]
  );

  const activitiesTotal = useMemo(() => {
    if (!tour) return 0;
    return tour.activities
      .filter((a) => a.locked || enabledActivities[a.id])
      .reduce((sum, a) => sum + (a.included ? 0 : a.price), 0);
  }, [tour, enabledActivities]);

  const tourBase = pkg?.price || 0;
  const total = tourBase + activitiesTotal;

  const selectedSlot = tour?.slots.find((s) => s.id === selectedSlotId) || null;
  const slotsWithStatus = useMemo(() => {
    if (!tour) return [];
    return tour.slots.map((s) =>
      s.id === selectedSlotId ? { ...s, status: "selected" } : s
    );
  }, [tour, selectedSlotId]);

//   const handleBook = async () => {
//     if (!isAuthenticated) {
//       navigate("/login?redirect=" + encodeURIComponent(`/tours/${id}`));
//       return;
//     }
//     if (String(userRole).toLowerCase() !== "tourist") {
//       setMsg({ type: "error", text: "Only tourists can book tours." });
//       return;
//     }
//     if (!selectedSlotId) {
//       setMsg({ type: "error", text: "Please select an available slot." });
//       return;
//     }
//     if (!selectedPackage) {
//       setMsg({ type: "error", text: "Please select a package." });
//       return;
//     }
//     setBooking(true);
//     setMsg({ type: "", text: "" });
//     try {
//       const result = await touristApi.createBooking({
//         tourId: id,
//         slotId: selectedSlotId,
//         groupSize: GROUP_META[selectedPackage]?.size || 1,
//         members: [],
//         deselectedActivityIds: tour.activities
//           .filter((a) => a.locked || enabledActivities[a.id])
//           .map((a) => a.id),
//       });
//       const bookingId = result?.booking?._id || result?.booking?.id || result?._id || result?.id;
//       setShowReview(false);
//       if (bookingId) {
//         navigate(`/tourist/bookings/${bookingId}/confirmation`);
//       } else {
//         setMsg({ type: "success", text: "Booking created! Redirecting..." });
//       }
//     } catch (err) {
//         console.log("BOOKING ERROR:", err.response?.data);
//         console.log("STATUS:", err.response?.status);

//         setMsg({
//           type: "error",
//           text: err.response?.data?.message || err.message || "Booking failed."
//         });
// } finally {
//       setBooking(false);
//     }
//   };

  const handleBook = async () => {
  if (!isAuthenticated) {
    navigate("/login?redirect=" + encodeURIComponent(`/tours/${id}`));
    return;
  }
  if (String(userRole).toLowerCase() !== "tourist") {
    setMsg({ type: "error", text: "Only tourists can book tours." });
    return;
  }
  if (!selectedSlotId) {
    setMsg({ type: "error", text: "Please select an available slot." });
    return;
  }
  if (!selectedPackage) {
    setMsg({ type: "error", text: "Please select a package." });
    return;
  }
  setBooking(true);
  setMsg({ type: "", text: "" });
  try {
    // 1) Create the booking
    const result = await touristApi.createBooking({
      tourId: id,
      slotId: selectedSlotId,
      groupSize: GROUP_META[selectedPackage]?.size || 1,
      members: [],
      deselectedActivityIds: tour.activities
        .filter((a) => !a.locked && !enabledActivities[a.id])
        .map((a) => a.id),
    });

    const bookingId = result?.booking?._id || result?.booking?.id || result?._id || result?.id;

    if (!bookingId) {
      setMsg({ type: "error", text: "Booking was created but no booking ID was returned." });
      setBooking(false);
      return;
    }

    //  actually start the Stripe checkout session instead of
    // navigating straight to a local confirmation page
    const checkoutRes = await createCheckoutSession(bookingId);
    const checkoutUrl = checkoutRes?.url || checkoutRes?.data?.url || checkoutRes?.checkoutUrl;

    if (!checkoutUrl) {
      setMsg({ type: "error", text: "Could not start the payment session. Please try again." });
      setBooking(false);
      return;
    }

    // Redirect the browser to Stripe's hosted checkout page.
    // Stripe will redirect back to your success/cancel URL after payment,
    // which should land on CheckoutResult with this bookingId.
    window.location.href = checkoutUrl;
  } catch (err) {
    console.log("BOOKING ERROR:", err.response?.data);
    console.log("STATUS:", err.response?.status);

    setMsg({
      type: "error",
      text: err.response?.data?.message || err.message || "Booking failed."
    });
    setBooking(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--maincolor)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center flex flex-col gap-3">
          <p className="text-red-600 text-sm">{error}</p>
          <Link to="/tours" className="text-sm text-[var(--maincolor)] underline inline-flex items-center justify-center gap-1.5">
            <ArrowLeft size={14} /> Back to tours
          </Link>
        </div>
      </div>
    );
  }

  if (!tour) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-[1920px] mx-auto px-8 lg:px-24 py-12 flex flex-col gap-22">
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Left column */}
          <div className="flex flex-col gap-12 flex-1 w-full">
            {tour.tags.length > 0 && (
              <div className="flex flex-wrap gap-6">
                {tour.tags.map((t) => (
                  <span key={t} className="bg-[rgba(1,1,112,0.15)] text-[var(--maincolor)] rounded-full px-8 py-2 text-xl font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Gallery */}
            {tour.gallery.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-6 w-full">
                <img src={tour.gallery[0]} alt="" className="rounded-2xl object-cover w-full sm:w-[40%] h-[300px] sm:h-[500px]" />
                {tour.gallery.length > 1 && (
                  <div className="grid grid-cols-2 gap-6 flex-1">
                    {tour.gallery.slice(1).map((src, i) => (
                      <img key={i} src={src} alt="" className="rounded-2xl object-cover w-full h-[240px]" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title + description */}
            <div className="flex flex-col gap-6">
              <h1 className="font-semibold text-3xl md:text-4xl text-[var(--maintaxt)]">{tour.title}</h1>
              {tour.description && (
                <p className="text-xl md:text-2xl text-[var(--mediumfont)] leading-relaxed">{tour.description}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-10">
              <StatItem icon={MapPin} label="Meeting point" value={tour.meetingPoint} />
              <StatItem icon={ClockIcon} label="duration" value={tour.duration} />
              <StatItem icon={Languages} label="languages" value={tour.languages} />
            </div>

            {/* Guide */}
            <div className="border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] px-6 md:px-8 py-6 w-full">
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <div className="flex flex-col gap-3 items-center shrink-0">
                  {tour.guide.photo ? (
                    <img src={tour.guide.photo} alt="guide" className="size-[110px] rounded-full object-cover" />
                  ) : (
                    <div className="size-[110px] rounded-full bg-[var(--lighttext)] flex items-center justify-center text-white text-2xl">
                      {tour.guide.name[0]}
                    </div>
                  )}
                  <p className="font-semibold text-xl text-[var(--maintaxt)]">{tour.guide.name}</p>
                </div>
                <div className="flex flex-col gap-4 flex-1 w-full">
                  <div className="flex flex-wrap gap-10">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Star className="size-6 text-[var(--maincolor)] fill-current" />
                        <span className="text-xl font-medium text-[var(--maincolor)]">{tour.guide.rating}</span>
                      </div>
                      <p className="text-sm tracking-[2.4px] uppercase text-[var(--mediumfont)]">Guide rating</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xl font-medium text-[var(--maincolor)]">{tour.guide.totalTours}</p>
                      <p className="text-sm tracking-[2.4px] uppercase text-[var(--mediumfont)]">total tours</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xl font-medium text-[var(--maincolor)]">{tour.guide.reviews}</p>
                      <p className="text-sm tracking-[2.4px] uppercase text-[var(--mediumfont)]">reviews</p>
                    </div>
                  </div>
                  {tour.guide.bio && <p className="text-lg text-[var(--maintaxt)]">{tour.guide.bio}</p>}
                  {/* <button className="self-start h-12 px-8 rounded-2xl border border-[#010170] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-[var(--maintaxt)] font-medium text-lg">
                    view guide profile
                  </button> */}
                </div>
              </div>
            </div>

            {/* Packages */}
            {tour.packages.length > 0 && (
              <div className="flex flex-col gap-8 w-full">
                <h2 className="font-semibold text-2xl text-[var(--maintaxt)]">Choose your package</h2>
                <div className="flex flex-wrap gap-6">
                  {tour.packages.map((p) => (
                    <PackageCard key={p.id} pkg={p} active={selectedPackage === p.id} onSelect={setSelectedPackage} />
                  ))}
                </div>
              </div>
            )}

            {/* Activities */}
            {tour.activities.length > 0 && (
              <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-4">
                  <h2 className="font-semibold text-2xl text-[var(--maintaxt)]">Included activities</h2>
                  <p className="text-xl text-[var(--maincolor)]">
                    Opt out of removable items; locked items are part of the core experience.
                  </p>
                </div>
                <div className="border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] overflow-hidden w-full">
                  {tour.activities.map((a, i) => (
                    <ActivityRow
                      key={a.id}
                      activity={a}
                      enabled={!!enabledActivities[a.id]}
                      onToggle={toggleActivity}
                      isFirst={i === 0}
                      isLast={i === tour.activities.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Time slots */}
            {tour.slots.length > 0 && (
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
                    {slotsWithStatus.map((s) => (
                      <SlotCard key={s.id} slot={s} onSelect={selectSlot} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {msg.text && (
              <p className={`rounded-xl border px-4 py-2 text-sm ${
                msg.type === "error"
                  ? "border-[#efc2c2] bg-[#fff2f2] text-[#a12121]"
                  : "border-[#bedfb8] bg-[#eefce9] text-[#1f6a21]"
              }`}>
                {msg.text}
              </p>
            )}
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
                    <p className="text-lg">Total{pkg ? ` . ${pkg.label}` : ""}</p>
                  </div>
                  <div className="flex flex-col gap-4 text-lg text-[var(--maintaxt)]">
                    <div className="flex items-center justify-between">
                      <p>Tour base{pkg ? ` . ${pkg.label}` : ""}</p>
                      <p>${tourBase}</p>
                    </div>
                    {tour.activities
                      .filter((a) => a.locked || enabledActivities[a.id])
                      .map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-[var(--maincolor)]">
                          <p>{a.title}</p>
                          <p>{a.included ? "Included" : `$${a.price}`}</p>
                        </div>
                      ))}
                  </div>
                </div>

                <hr className="border-[var(--lighttext)]" />

                <div className="flex items-center justify-between text-lg text-[var(--maintaxt)]">
                  <p>Activities subtotal</p>
                  <p>${activitiesTotal}</p>
                </div>

                <div className="flex flex-col gap-3 items-center">
                  <button
                    onClick={() => setShowReview(true)}
                    disabled={!selectedSlotId || !selectedPackage}
                    className="h-14 px-10 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-semibold text-lg w-full disabled:opacity-60"
                  >
                    {isAuthenticated ? "Proceed to booking" : "Log in to book"}
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
                  href="/cancellation-policy"
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
        onContinue={handleBook}
        loading={booking}                                    
        error={msg.type === "error" ? msg.text : null}        
        summary={{
          package: pkg?.label || "—",
          guestsNote: pkg?.guests || "—",
          price: `$${tourBase}`,
          activities: tour.activities
            .filter((a) => a.locked || enabledActivities[a.id])
            .map((a) => ({ name: a.title, price: a.included ? "Included" : `$${a.price}` })),
          date: selectedSlot ? `${selectedSlot.day} . ${selectedSlot.date}` : "—",
          time: selectedSlot?.time || "—",
          total: `$${total}`,
        }}
      />
    )}
    </div>
  );
}