import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toursApi } from "@/features/tours/api/toursApi";
import { touristApi } from "@/features/touristVerification/api/touristApi";
import { paymentApi } from "@/features/payment/api/paymentApi";
import { guidesApi } from "@/features/guide/api/guidesApi";
import useAuth from "@/contexts/useAuth";
import Navbar from "@/components/home/Navbar.jsx";
import CheckoutReviewModal from "../../bookingTour/components/CheckoutReviewModal";
import GroupSelection from "../../bookingTour/components/GroupSelection";
import {
  MapPin,
  Clock as ClockIcon,
  Languages,
  Star,
  Lock,
  Check,
  ArrowLeft,
} from "lucide-react";
import Footer from "@/components/home/Footer.jsx";

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
        <p className="text-base text-[var(--lighttext)] tracking-[3px] uppercase">
          {label}
        </p>
        <p className="font-semibold text-2xl text-[var(--maincolor)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function PackageCard({ pkg, active, onSelect, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(pkg.id)}
      className={`flex-1 min-w-[220px] text-left rounded-2xl border p-5 transition-colors disabled:cursor-default ${
        active
          ? "bg-[var(--maincolor)] border-[var(--lighttext)] shadow-[-8px_8px_24px_0px_rgba(1,1,56,0.25)]"
          : "bg-white border-[var(--lighttext)]"
      }`}
    >
      <div className="flex gap-8 items-start">
        <div className="flex flex-col gap-2 flex-1">
          <p
            className={`text-base tracking-[2.7px] uppercase ${active ? "text-[var(--lightblue)]" : "text-[var(--lighttext)]"}`}
          >
            {pkg.guests}
          </p>
          <p
            className={`text-xl font-medium ${active ? "text-white" : "text-[var(--maincolor)]"}`}
          >
            {pkg.label}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p
            className={`text-base ${active ? "text-[var(--lightblue)]" : "text-[var(--lighttext)]"}`}
          >
            From
          </p>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span
              className={`text-xl font-medium ${active ? "text-[var(--secondarycolor)]" : "text-[var(--maincolor)]"}`}
            >
              ${pkg.price}
            </span>
            <span
              className={`text-sm ${active ? "text-[var(--lightblue)]" : "text-[var(--lighttext)]"}`}
            >
              USD
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ActivityRow({
  activity,
  enabled,
  onToggle,
  isFirst,
  isLast,
  disabled = false,
}) {
  return (
    <div
      className={`bg-white p-6 w-full flex items-center justify-between gap-2 ${
        !isLast ? "border-b border-[var(--lighttext)]" : ""
      } ${isFirst ? "rounded-t-2xl" : ""} ${isLast ? "rounded-b-2xl" : ""}`}
    >
      <div className="flex gap-6 items-center flex-1">
        <button
          type="button"
          aria-label={`${enabled ? "Included" : "Not included"}: ${activity.title}`}
          disabled={disabled || activity.locked}
          onClick={() => onToggle(activity.id)}
          className={`shrink-0 size-[30px] rounded-2xl flex items-center justify-center ${
            activity.locked
              ? "bg-[var(--maincolor)]"
              : enabled
                ? "bg-[var(--maincolor)] border-[1.5px] border-[var(--maincolor)]"
                : "border-[1.5px] border-[var(--maincolor)]"
          }`}
        >
          {(activity.locked || enabled) && (
            <Lock className="size-4 text-white" />
          )}
        </button>
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xl font-medium text-[var(--maincolor)]">
            {activity.title}
          </p>
          {activity.desc && (
            <p className="text-lg text-[var(--mediumfont)]">{activity.desc}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center text-center shrink-0 w-[110px]">
        {activity.included ? (
          <span className="bg-[rgba(123,224,0,0.15)] text-[var(--darksuccess,#396504)] rounded-full px-5 py-1 text-base font-medium">
            Included
          </span>
        ) : (
          <span className="text-lg font-medium text-[var(--maincolor)]">
            ${activity.price}
          </span>
        )}
        {activity.note && (
          <span className="text-base font-medium text-[var(--mediumfont)]">
            {activity.note}
          </span>
        )}
      </div>
    </div>
  );
}

function SlotCard({ slot, onSelect, disabled = false }) {
  const base =
    "flex-1 min-w-[150px] rounded-2xl border px-5 py-5 flex flex-col gap-2 text-center";
  if (slot.status === "selected") {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(slot.id)}
        className={`${base} cursor-pointer bg-[var(--maincolor)] border-[var(--lighttext)] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] disabled:cursor-default`}
      >
        <p className="text-base text-[var(--lightblue)] tracking-[2.7px] uppercase">
          {slot.day}
        </p>
        <p className="text-lg font-medium text-white">{slot.date}</p>
        <p className="text-base font-medium text-[var(--lightblue)]">
          {slot.time}
        </p>
      </button>
    );
  }
  if (slot.status === "unavailable") {
    return (
      <button
        type="button"
        disabled
        className={`${base} bg-[#eeeef0] border-[var(--lighttext)] cursor-not-allowed`}
      >
        <p className="text-base text-[var(--mediumfont)] tracking-[2.7px] uppercase">
          {slot.day}
        </p>
        <p className="text-lg font-medium text-[var(--maintaxt)]">
          {slot.date}
        </p>
        <p className="text-base font-medium text-[var(--mediumfont)] line-through">
          {slot.time}
        </p>
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(slot.id)}
      className={`${base} cursor-pointer bg-white border-[var(--lighttext)] hover:border-[var(--maincolor)] disabled:cursor-default disabled:hover:border-[var(--lighttext)]`}
    >
      <p className="text-base text-[var(--mediumfont)] tracking-[2.7px] uppercase">
        {slot.day}
      </p>
      <p className="text-lg font-medium text-[var(--maintaxt)]">{slot.date}</p>
      <p className="text-base font-medium text-[var(--mediumfont)]">
        {slot.time}
      </p>
    </button>
  );
}

const getAssetUrl = (value) => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value.secureUrl ?? value.secure_url ?? value.url ?? value.src ?? "";
};

const getTourGuideId = (data) => {
  const reference = data?.guide ?? data?.guideId;
  if (typeof reference === "string") return reference;

  return String(
    reference?._id ??
      reference?.id ??
      data?.guideId?._id ??
      data?.guideId?.id ??
      "",
  );
};

const getGuideSource = (payload) =>
  payload?.guide ?? payload?.user ?? payload?.profile ?? payload ?? {};

const getActivityPrice = (activity, groupType) =>
  Number(activity?.pricing?.[groupType] ?? activity?.price) || 0;

function mapTour(data, publicGuideProfile = null) {
  const pricing = data.pricing || {};
  const packages = Object.keys(GROUP_META)
    .filter((k) => pricing[k] > 0)
    .map((k) => ({
      id: k,
      label: GROUP_META[k].label,
      guests: GROUP_META[k].guests,
      price: pricing[k],
    }));

  const gallery = [
    getAssetUrl(data.coverImage),
    ...(Array.isArray(data.galleryImages)
      ? data.galleryImages.map(getAssetUrl)
      : Array.isArray(data.images)
        ? data.images.map(getAssetUrl)
      : []),
  ].filter(Boolean);

  const activities = (data.activities || []).map((act, i) => {
    const activityPricing =
      act?.pricing && typeof act.pricing === "object" ? act.pricing : {};
    const priceValue = Number(act.price) || 0;
    const hasPricedOption = Object.values(activityPricing).some(
      (price) => Number(price) > 0,
    );
    const included = act.included ?? (!hasPricedOption && priceValue === 0);
    return {
      id: act._id || act.id || String(i),
      title: act.name || act.title || "Activity",
      desc: act.description || "",
      included,
      locked: Boolean(act.locked ?? act.removable === false),
      removable: act.removable !== false,
      pricing: activityPricing,
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
      time: slot.startTime
        ? `${slot.startTime}${slot.endTime ? " - " + slot.endTime : ""}`
        : "",
      status:
        slot.available === false || slot.isBooked
          ? "unavailable"
          : "available",
    };
  });

  const embeddedGuide =
    data?.guide && typeof data.guide === "object"
      ? data.guide
      : data?.guideId && typeof data.guideId === "object"
        ? data.guideId
        : {};
  const publicGuide = getGuideSource(publicGuideProfile);
  const guide = publicGuideProfile ? publicGuide : embeddedGuide;

  return {
    id: data._id || data.id,
    title: data.title || "",
    description: data.description || "",
    tags: data.categories || data.tags || [],
    meetingPoint: data.meetingPoint || data.destination || "",
    duration: data.duration || "",
    languages: Array.isArray(data.languages)
      ? data.languages.join(", ")
      : data.language || "",
    gallery,
    guide: {
      id: getTourGuideId(data),
      name: guide?.fullName || guide?.name || "Local Guide",
      photo:
        getAssetUrl(guide?.profilePhoto) ||
        getAssetUrl(guide?.profilePicture) ||
        getAssetUrl(guide?.avatar) ||
        getAssetUrl(embeddedGuide?.profilePhoto),
      rating:
        Number(
          guide?.averageRating ??
            guide?.rating ??
            guide?.reviewsSummary?.averageRating,
        ) || 0,
      totalTours:
        Number(
          guide?.totalTours ?? guide?.activeToursCount ?? guide?.toursCount,
        ) || 0,
      reviews:
        Number(
          guide?.reviewCount ??
            guide?.reviewsCount ??
            guide?.reviewsSummary?.count,
        ) || 0,
      bio: guide?.bio || "",
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
  const normalizedRole = String(userRole ?? "").toLowerCase();
  const isTourist = isAuthenticated && normalizedRole === "tourist";
  const isReadOnly = !isTourist;

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPackage, setSelectedPackage] = useState("");
  const [enabledActivities, setEnabledActivities] = useState({});
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [booking, setBooking] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Group selection state
  const [showGroupSelection, setShowGroupSelection] = useState(false);
  const [groupSize, setGroupSize] = useState(null); // actual headcount chosen in GroupSelection
  const [groupMembers, setGroupMembers] = useState([]); // saved member list from GroupSelection
  const [touristName, setTouristName] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTour = async () => {
      setLoading(true);
      setError(null);

      try {
        const tourRecord = await toursApi.getTourDetails(id);
        const guideId = getTourGuideId(tourRecord);
        let guideProfile = null;

        if (guideId) {
          try {
            guideProfile = await guidesApi.getPublicGuide(guideId);
          } catch {
            // The embedded guide remains a safe fallback if profile loading fails.
          }
        }

        if (!isMounted) return;
        const mapped = mapTour(tourRecord, guideProfile);
        setTour(mapped);
        if (mapped.packages.length > 0)
          setSelectedPackage(mapped.packages[0].id);

        // Fetch tourist profile to pre-fill group modal
        if (isTourist) {
          try {
            const profile = await touristApi.getProfile();
            setTouristName(profile?.fullName || profile?.name || "");
          } catch {
            // non-critical
          }
        }
        const lockedDefaults = {};
        mapped.activities.forEach((a) => {
          if (a.locked || a.included) lockedDefaults[a.id] = true;
        });
        setEnabledActivities(lockedDefaults);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Failed to load tour");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadTour();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const toggleActivity = (activityId) => {
    if (isReadOnly) return;

    setEnabledActivities((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }));
  };

  const selectSlot = (slotId) => {
    if (isReadOnly) return;
    setSelectedSlotId((prev) => (prev === slotId ? null : slotId));
  };

  const pkg = useMemo(
    () => tour?.packages.find((p) => p.id === selectedPackage) || null,
    [tour, selectedPackage],
  );

  const activitiesTotal = useMemo(() => {
    if (!tour) return 0;
    return tour.activities
      .filter((a) => a.locked || enabledActivities[a.id])
      .reduce(
        (sum, activity) =>
          sum +
          (activity.included
            ? 0
            : getActivityPrice(activity, selectedPackage)),
        0,
      );
  }, [tour, enabledActivities, selectedPackage]);

  // When the package changes, reset saved group data
  const handlePackageSelect = (pkgId) => {
    if (isReadOnly) return;
    setSelectedPackage(pkgId);
    setGroupSize(null);
    setGroupMembers([]);
    // For group packages, immediately open GroupSelection
    const meta = GROUP_META[pkgId];
    if (meta && meta.size > 1) {
      setShowGroupSelection(true);
    }
  };

  // Called when GroupSelection "Confirm" is clicked
  const handleGroupSave = ({ groupSize: size, members }) => {
    setGroupSize(size);
    setGroupMembers(members);
  };

  // Effective group size: user-chosen (from modal) or package default
  const effectiveGroupSize = groupSize ?? GROUP_META[selectedPackage]?.size ?? 1;

  const tourBase = pkg ? pkg.price * effectiveGroupSize : 0;
  const total = tourBase + activitiesTotal * effectiveGroupSize;

  const selectedSlot = tour?.slots.find((s) => s.id === selectedSlotId) || null;
  const slotsWithStatus = useMemo(() => {
    if (!tour) return [];
    return tour.slots.map((s) =>
      s.id === selectedSlotId ? { ...s, status: "selected" } : s,
    );
  }, [tour, selectedSlotId]);

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
      let bookingId = pendingBookingId;

      if (!bookingId) {
        const result = await touristApi.createBooking({
          tourId: id,
          slotId: selectedSlotId,
          groupSize: effectiveGroupSize,
          members: groupMembers,
          deselectedActivityIds: tour.activities
            .filter(
              (activity) => !activity.locked && !enabledActivities[activity.id],
            )
            .map((activity) => activity.id),
        });
        const bookingRecord = result?.booking ?? result;
        bookingId =
          result?.bookingId ?? bookingRecord?._id ?? bookingRecord?.id ?? "";

        if (!bookingId) {
          throw new Error("The booking was created without a booking ID.");
        }

        setPendingBookingId(bookingId);
      }

      sessionStorage.setItem("pendingPaymentBookingId", bookingId);
      const { checkoutUrl } = await paymentApi.createCheckoutSession(bookingId);

      setShowReview(false);
      paymentApi.redirectToCheckout(checkoutUrl);
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Unable to start secure checkout.",
      });
    } finally {
      setBooking(false);
    }
  };

  const handleBookingAction = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=" + encodeURIComponent(`/tours/${id}`));
      return;
    }

    if (!isTourist) return;
    setShowReview(true);
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
          <Link
            to="/tours"
            className="text-sm text-[var(--maincolor)] underline inline-flex items-center justify-center gap-1.5"
          >
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
        <Link
          to="/tours"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#d8d7e8] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--maincolor)] shadow-sm transition hover:border-[var(--maincolor)] hover:bg-[#f7f7fc]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to tours
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Left column */}
          <div className="flex flex-col gap-12 flex-1 w-full">
            {tour.tags.length > 0 && (
              <div className="flex flex-wrap gap-6">
                {tour.tags.map((t) => (
                  <span
                    key={t}
                    className="bg-[rgba(1,1,112,0.15)] text-[var(--maincolor)] rounded-full px-8 py-2 text-xl font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Gallery */}
            {tour.gallery.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-6 w-full">
                <img
                  src={tour.gallery[0]}
                  alt=""
                  className="rounded-2xl object-cover w-full sm:w-[40%] h-[300px] sm:h-[500px]"
                />
                {tour.gallery.length > 1 && (
                  <div className="grid grid-cols-2 gap-6 flex-1">
                    {tour.gallery.slice(1).map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="rounded-2xl object-cover w-full h-[240px]"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title + description */}
            <div className="flex flex-col gap-6">
              <h1 className="font-semibold text-3xl md:text-4xl text-[var(--maintaxt)]">
                {tour.title}
              </h1>
              {tour.description && (
                <p className="text-xl md:text-2xl text-[var(--mediumfont)] leading-relaxed">
                  {tour.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-10">
              <StatItem
                icon={MapPin}
                label="Meeting point"
                value={tour.meetingPoint}
              />
              <StatItem
                icon={ClockIcon}
                label="duration"
                value={tour.duration}
              />
              <StatItem
                icon={Languages}
                label="languages"
                value={tour.languages}
              />
            </div>

            {/* Guide */}
            <div className="border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] px-6 md:px-8 py-6 w-full">
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <div className="flex flex-col gap-3 items-center shrink-0">
                  {tour.guide.photo ? (
                    <img
                      src={tour.guide.photo}
                      alt="guide"
                      className="size-[110px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-[110px] rounded-full bg-[var(--lighttext)] flex items-center justify-center text-white text-2xl">
                      {tour.guide.name[0]}
                    </div>
                  )}
                  <p className="font-semibold text-xl text-[var(--maintaxt)]">
                    {tour.guide.name}
                  </p>
                </div>
                <div className="flex flex-col gap-4 flex-1 w-full">
                  <div className="flex flex-wrap gap-10">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Star className="size-6 text-[var(--maincolor)] fill-current" />
                        <span className="text-xl font-medium text-[var(--maincolor)]">
                          {tour.guide.rating}
                        </span>
                      </div>
                      <p className="text-sm tracking-[2.4px] uppercase text-[var(--mediumfont)]">
                        Guide rating
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xl font-medium text-[var(--maincolor)]">
                        {tour.guide.totalTours}
                      </p>
                      <p className="text-sm tracking-[2.4px] uppercase text-[var(--mediumfont)]">
                        total tours
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xl font-medium text-[var(--maincolor)]">
                        {tour.guide.reviews}
                      </p>
                      <p className="text-sm tracking-[2.4px] uppercase text-(--mediumfont)">
                        reviews
                      </p>
                    </div>
                  </div>
                  {tour.guide.bio && (
                    <p className="text-lg text-[var(--maintaxt)]">
                      {tour.guide.bio}
                    </p>
                  )}
                  {tour.guide.id && (
                    <Link
                      to={`/guides/${tour.guide.id}`}
                      className="btn self-start h-12 px-8 rounded-2xl border border-[#010170] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-[var(--maintaxt)] font-medium text-lg"
                    >
                      View guide profile
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Packages */}
            {tour.packages.length > 0 && (
              <div className="flex flex-col gap-8 w-full">
                <h2 className="font-semibold text-2xl text-[var(--maintaxt)]">
                  Choose your package
                </h2>
                <div className="flex flex-wrap gap-6">
                  {tour.packages.map((p) => (
                    <PackageCard
                      key={p.id}
                      pkg={p}
                      active={selectedPackage === p.id}
                      onSelect={handlePackageSelect}
                      disabled={isReadOnly}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Activities */}
            {tour.activities.length > 0 && (
              <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-4">
                  <h2 className="font-semibold text-2xl text-[var(--maintaxt)]">
                    Included activities
                  </h2>
                  <p className="text-xl text-[var(--maincolor)]">
                    {isReadOnly
                      ? "Activities included with this experience."
                      : "Opt out of removable items; locked items are part of the core experience."}
                  </p>
                </div>
                <div className="border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] overflow-hidden w-full">
                  {tour.activities.map((a, i) => (
                    <ActivityRow
                      key={a.id}
                      activity={{
                        ...a,
                        price: getActivityPrice(a, selectedPackage),
                      }}
                      enabled={!!enabledActivities[a.id]}
                      onToggle={toggleActivity}
                      disabled={isReadOnly}
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
                  <h2 className="font-semibold text-2xl text-[var(--maintaxt)]">
                    Available time slots
                  </h2>
                  <p className="text-xl text-[var(--maincolor)]">
                    {isReadOnly
                      ? "Available dates and times for this experience."
                      : "Pick a window. Booked slots return to availability if the guide cancels."}
                  </p>
                </div>
                <div className="flex flex-col gap-6 w-full items-center">
                  <div className="flex flex-wrap gap-8">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-[var(--maincolor)]" />
                      <span className="text-lg text-[var(--maincolor)]">
                        Selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-white border border-[var(--lighttext)]" />
                      <span className="text-lg text-[var(--maincolor)]">
                        Available
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-[#eeeef0]" />
                      <span className="text-lg text-[var(--maincolor)]">
                        Unavailable
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 w-full">
                    {slotsWithStatus.map((s) => (
                      <SlotCard
                        key={s.id}
                        slot={s}
                        onSelect={selectSlot}
                        disabled={isReadOnly}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {msg.text && (
              <p
                className={`rounded-xl border px-4 py-2 text-sm ${
                  msg.type === "error"
                    ? "border-[#efc2c2] bg-[#fff2f2] text-[#a12121]"
                    : "border-[#bedfb8] bg-[#eefce9] text-[#1f6a21]"
                }`}
              >
                {msg.text}
              </p>
            )}
          </div>

          {/* Right column - live receipt */}
          <div className="flex flex-col gap-8 w-full lg:w-[420px] shrink-0 lg:sticky lg:top-8">
            <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] px-8 py-10 w-full">
              <div className="flex flex-col gap-10">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-[var(--mediumfont)] tracking-[3.6px] uppercase">
                    Live receipt
                  </p>
                  <span className="bg-[rgba(1,1,112,0.05)] text-[var(--mediumfont)] rounded-full px-6 py-2 text-base font-medium">
                    {isTourist ? "Editable" : "Read-only"}
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-end gap-2 text-[var(--maincolor)]">
                    <p className="font-semibold text-3xl">${total}</p>
                    <p className="text-lg">
                      Total{pkg ? ` . ${pkg.label}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 text-lg text-[var(--maintaxt)]">
                    <div className="flex items-center justify-between">
                      <p>
                        Tour base{pkg ? ` . ${pkg.label}` : ""}
                        {effectiveGroupSize > 1 && (
                          <span className="ml-2 text-base text-[var(--mediumfont)]">
                            × {effectiveGroupSize} guests
                          </span>
                        )}
                      </p>
                      <p>${tourBase}</p>
                    </div>
                    {tour.activities
                      .filter((a) => a.locked || enabledActivities[a.id])
                      .map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between text-[var(--maincolor)]"
                        >
                          <p>
                            {a.title}
                            {pkg && !a.included && effectiveGroupSize > 1 && (
                              <span className="ml-1 text-sm text-[var(--mediumfont)]">
                                . {pkg.label} × {effectiveGroupSize} guests
                              </span>
                            )}
                          </p>
                          <p>
                            {a.included
                              ? "Included"
                              : `$${getActivityPrice(a, selectedPackage) * effectiveGroupSize}`}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                <hr className="border-[var(--lighttext)]" />

                <div className="flex items-center justify-between text-lg text-[var(--maintaxt)]">
                  <p>Activities subtotal</p>
                  <p>${activitiesTotal * effectiveGroupSize}</p>
                </div>

                <div className="flex flex-col gap-3 items-center">
                  {isTourist && selectedPackage && GROUP_META[selectedPackage]?.size > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowGroupSelection(true)}
                      className="h-12 px-6 rounded-2xl border border-[var(--maincolor)] text-[var(--maincolor)] font-medium text-base w-full hover:bg-[rgba(1,1,112,0.05)] transition-colors"
                    >
                      {groupSize
                        ? `Edit Group · ${effectiveGroupSize} guests`
                        : "Set Up Group Members"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleBookingAction}
                    disabled={
                      (isAuthenticated && !isTourist) ||
                      (isTourist && (!selectedSlotId || !selectedPackage))
                    }
                    className="h-14 px-6 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-semibold text-base w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {!isAuthenticated
                      ? "Log in as a tourist to book"
                      : isTourist
                        ? "Proceed to booking"
                        : "Available to tourist accounts only"}
                  </button>
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-[var(--maincolor)]" />
                    <p className="text-sm font-light text-[var(--maincolor)]">
                      Secure instant booking · Stripe
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <details
              id="cancellation-policy"
              className="group rounded-2xl border border-[#ded7b5] bg-[#fffdf5] p-5"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 text-[var(--darkgold)]">
              <Check className="size-10 text-[var(--darkgold)] shrink-0" />
                <span className="text-lg font-medium underline">
                  View our cancellation policy
                </span>
              </summary>
              <p className="mt-4 border-t border-[#ded7b5] pt-4 text-sm leading-6 text-[rgba(96,81,28,0.82)]">
                Cancellation eligibility and refunds depend on the booking
                status and how close the tour is to its start time. Your exact
                refund terms are shown before payment and remain available in
                your booking history.
              </p>
            </details>
          </div>
        </div>
      </main>

      <Footer />

      {showGroupSelection && isTourist && (
        <GroupSelection
          isOpen={showGroupSelection}
          onClose={() => setShowGroupSelection(false)}
          onSave={handleGroupSave}
          initialGroupSize={groupSize ?? GROUP_META[selectedPackage]?.size ?? 2}
          initialMembers={groupMembers.slice(1)} // exclude primary (index 0)
          touristAccountName={touristName}
        />
      )}

      {showReview && isTourist && (
        <CheckoutReviewModal
          className="max-w-[200px] h-[220px]"
          onClose={() => setShowReview(false)}
          onBack={() => setShowReview(false)}
          onContinue={handleBook}
          continueLabel={booking ? "Opening Stripe..." : "Continue to payment"}
          continueDisabled={booking}
          error={msg.type === "error" ? msg.text : null}
          summary={{
            package: pkg?.label || "—",
            guestsNote:
              effectiveGroupSize > 1
                ? `${effectiveGroupSize} guests`
                : pkg?.guests || "—",
            price: `$${tourBase}`,
            activities: tour.activities
              .filter((a) => a.locked || enabledActivities[a.id])
              .map((a) => ({
                name: a.title,
                price: a.included
                  ? "Included"
                  : `$${getActivityPrice(a, selectedPackage) * effectiveGroupSize}`,
              })),
            date: selectedSlot
              ? `${selectedSlot.day} . ${selectedSlot.date}`
              : "—",
            time: selectedSlot?.time || "—",
            total: `$${total}`,
          }}
        />
      )}
    </div>
  );
}