const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  return (
    payload.bookings ??
    payload.items ??
    payload.results ??
    payload.docs ??
    payload.data ??
    []
  );
};

const getAssetUrl = (value) => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  return value.secureUrl ?? value.secure_url ?? value.url ?? value.src ?? "";
};

const asDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(date)
    : "Date not set";

const normalizeStatus = (value) => {
  const status = String(value ?? "").trim().toLowerCase();
  if (/cancel/.test(status)) return "cancelled";
  if (/complete|past|finished/.test(status)) return "completed";
  if (/active|confirm|paid|upcoming/.test(status)) return "upcoming";
  if (/pending/.test(status)) return "upcoming";
  return status || "upcoming";
};

export const mapGuideBooking = (record, index = 0) => {
  const tour = record?.tour ?? record?.tourId ?? {};
  const tourist = record?.tourist ?? record?.touristId ?? record?.user ?? {};
  const slot = record?.slot ?? record?.slotId ?? {};
  const rawDate =
    slot?.date ?? record?.date ?? record?.tourDate ?? record?.scheduledAt;
  const date = asDate(rawDate);
  const status = normalizeStatus(
    record?.status ?? record?.bookingStatus ?? record?.state,
  );
  const total = Number(
    record?.total ??
      record?.totalAmount ??
      record?.amount ??
      record?.pricing?.total ??
      record?.payment?.amount,
  );

  return {
    id: String(record?._id ?? record?.id ?? `booking-${index}`),
    title: tour?.title ?? record?.tourTitle ?? "Tour booking",
    touristName: tourist?.fullName ?? tourist?.name ?? "Traveler",
    touristLocation:
      tourist?.nationality ?? tourist?.country ?? tourist?.city ?? "",
    city: tour?.destination ?? record?.destination ?? "",
    date,
    dateLabel: formatDate(date),
    time:
      slot?.startTime ?? record?.startTime ?? record?.time ?? "Time not set",
    status,
    rawStatus: String(record?.status ?? record?.bookingStatus ?? ""),
    total: Number.isFinite(total) ? total : 0,
    currency: record?.currency ?? record?.payment?.currency ?? "USD",
    paymentStatus: String(
      record?.payment?.status ?? record?.paymentStatus ?? "",
    ).toLowerCase(),
    cancellationReason:
      record?.cancellation?.reason ?? record?.cancellationReason ?? "",
    cancelledBy:
      record?.cancellation?.cancelledBy ?? record?.cancelledBy ?? "",
    refundAmount:
      Number(record?.refund?.amount ?? record?.refundedAmount) || 0,
    review: record?.review ?? null,
    image: getAssetUrl(tour?.coverImage),
    source: record,
  };
};

export const mapGuideBookings = (payload) =>
  toArray(payload).map(mapGuideBooking);

export const summarizeGuideBookings = (bookings) => {
  const completed = bookings.filter((booking) => booking.status === "completed");
  const active = bookings.filter((booking) => booking.status === "upcoming");
  const cancelled = bookings.filter((booking) => booking.status === "cancelled");
  const paidBookings = bookings.filter((booking) =>
    ["paid", "succeeded", "refunded"].includes(booking.paymentStatus),
  );
  const earningRecords = paidBookings.length > 0 ? paidBookings : completed;

  return {
    totalBookings: bookings.length,
    activeBookings: active.length,
    completedBookings: completed.length,
    cancelledBookings: cancelled.length,
    totalEarnings: earningRecords.reduce(
      (sum, booking) => sum + booking.total,
      0,
    ),
  };
};
