import { IMG } from "@/assets/images/landingPage/images.js";

const LANGUAGE_LABELS = {
  ar: "Arabic",
  en: "English",
  de: "German",
  it: "Italian",
  es: "Spanish",
  fr: "French",
};

const getAssetUrl = (value) => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  return (
    value.secureUrl ??
    value.secure_url ??
    value.url ??
    value.src ??
    value.path ??
    ""
  );
};

const toList = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  return [];
};

const toDisplayList = (value) => {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,|]/)
      : [];

  return source
    .map((entry) => {
      const raw =
        typeof entry === "string"
          ? entry
          : entry?.label ?? entry?.name ?? entry?.code ?? entry?.value ?? "";
      const normalized = String(raw).trim();

      if (!normalized) return "";

      return (
        LANGUAGE_LABELS[normalized.toLowerCase()] ??
        normalized
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, (character) => character.toUpperCase())
      );
    })
    .filter(Boolean);
};

const getGuideSource = (record) =>
  record?.guide ?? record?.user ?? record?.profile ?? record ?? {};

const getGuideId = (record) => {
  const source = getGuideSource(record);
  return String(
    source?._id ??
      source?.id ??
      record?.guideId?._id ??
      record?.guideId?.id ??
      record?.guideId ??
      record?._id ??
      record?.id ??
      "",
  );
};

const getReviewData = (record) => {
  const reviews = record?.reviewsSummary ?? record?.reviewStats ?? record?.reviews ?? {};

  return {
    rating:
      Number(
        record?.averageRating ??
          record?.rating ??
          reviews?.averageRating ??
          reviews?.average,
      ) || 0,
    reviewCount:
      Number(
        record?.reviewCount ??
          record?.reviewsCount ??
          reviews?.count ??
          reviews?.total,
      ) || 0,
  };
};

export const mapPublicGuide = (record, index = 0) => {
  const source = getGuideSource(record);
  const verification =
    record?.guideVerification ?? record?.verification ?? source?.verification ?? {};
  const { rating, reviewCount } = getReviewData(source);
  const id = getGuideId(record);
  const languages = toDisplayList(
    source?.verifiedLanguages?.length
      ? source.verifiedLanguages
      : source?.languages,
  );

  return {
    id: id || source?.email || source?.fullName || `guide-${index}`,
    sourceId: id,
    name: source?.fullName ?? source?.name ?? "Local guide",
    city:
      source?.city ??
      source?.location ??
      source?.nationality ??
      verification?.nationality ??
      "Egypt",
    languages: languages.length ? languages.join(", ") : "Languages not listed",
    rating,
    reviewCount,
    photo:
      getAssetUrl(source?.profilePhoto) ||
      getAssetUrl(source?.avatar) ||
      getAssetUrl(verification?.profilePhoto) ||
      getAssetUrl(verification?.verificationDocuments?.profilePhoto) ||
      IMG.avatar,
    fallbackPhoto: IMG.avatar,
    href: "/signup",
  };
};

const getTourPrice = (pricing, priceGroupType = "") => {
  if (!pricing || typeof pricing !== "object") return 0;

  if (priceGroupType) {
    const groupPrice = Number(pricing[priceGroupType]);

    if (Number.isFinite(groupPrice) && groupPrice > 0) {
      return groupPrice;
    }
  }

  const prices = Object.values(pricing)
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);

  return prices.length ? Math.min(...prices) : 0;
};

const getTourGuideId = (record) =>
  String(
    record?.guide?._id ??
      record?.guide?.id ??
      record?.guideId?._id ??
      record?.guideId?.id ??
      record?.guideId ??
      "",
  );

export const mapActiveTour = (
  record,
  guideById = new Map(),
  index = 0,
  { priceGroupType = "", href = "/signup" } = {},
) => {
  const guideId = getTourGuideId(record);
  const matchedGuide = guideById.get(guideId);
  const embeddedGuide = record?.guide ?? record?.guideId ?? {};
  const { rating, reviewCount } = getReviewData(record);
  const activities = Array.isArray(record?.activities) ? record.activities : [];
  const price = getTourPrice(record?.pricing, priceGroupType);

  return {
    id: String(record?._id ?? record?.id ?? `tour-${index}`),
    title: record?.title ?? "Local experience",
    matchTag: record?.destination ? `Explore ${record.destination}` : "",
    tags: activities
      .map((activity) => activity?.name)
      .filter(Boolean)
      .slice(0, 2),
    guide:
      matchedGuide?.name ??
      embeddedGuide?.fullName ??
      embeddedGuide?.name ??
      "Local guide",
    avatar:
      matchedGuide?.photo ||
      getAssetUrl(embeddedGuide?.profilePhoto) ||
      IMG.avatar,
    fallbackAvatar: IMG.avatar,
    photo: getAssetUrl(record?.coverImage),
    rating,
    reviewCount,
    duration: record?.duration ?? "Duration to be confirmed",
    groupType:
      priceGroupType === "PRIVATE"
        ? "Private tour"
        : "Private and group options",
    price: price > 0 ? `$${price.toLocaleString("en-US")} USD` : "Contact guide",
    href,
  };
};

export const mapPublicGuides = (payload) =>
  toList(payload, ["guides", "items", "results", "docs"]).map(
    mapPublicGuide,
  );

export const mapActiveTours = (payload, guides = [], options = {}) => {
  const guideById = new Map(
    guides
      .filter((guide) => guide.sourceId)
      .map((guide) => [guide.sourceId, guide]),
  );

  return toList(payload, ["tours", "items", "results", "docs"]).map(
    (tour, index) => mapActiveTour(tour, guideById, index, options),
  );
};
