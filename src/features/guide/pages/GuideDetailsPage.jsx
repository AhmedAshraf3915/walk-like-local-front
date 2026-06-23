import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Globe,
  Languages,
  MapPin,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

import GuideNavbar from "@/components/home/GuideNavbar.jsx";
import Footer from "@/components/home/Footer.jsx";
import { guidesApi } from "@/features/guide/api/guidesApi.js";

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

const toDisplayLanguages = (value) => {
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
          : (entry?.label ?? entry?.name ?? entry?.code ?? entry?.value ?? "");
      const normalized = String(raw).trim();
      if (!normalized) return "";
      return (
        LANGUAGE_LABELS[normalized.toLowerCase()] ??
        normalized
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      );
    })
    .filter(Boolean);
};

const mapGuide = (data) => {
  const source = data?.guide ?? data?.profile ?? data ?? {};
  const languages = toDisplayLanguages(
    source?.verifiedLanguages?.length
      ? source.verifiedLanguages
      : source?.languages,
  );

  return {
    id: source?._id ?? source?.id ?? "",
    fullName: source?.fullName ?? source?.name ?? "",
    photo:
      getAssetUrl(source?.profilePhoto) ||
      getAssetUrl(source?.profilePicture) ||
      getAssetUrl(source?.avatar),
    bio: source?.bio ?? "",
    rating: Number(source?.rating ?? source?.averageRating) || 0,
    reviewCount: Number(source?.reviewCount ?? source?.reviewsCount) || 0,
    nationality: source?.nationality ?? source?.city ?? source?.location ?? "",
    experience: source?.experience?.year ?? "",
    interests: Array.isArray(source?.interests) ? source.interests : [],
    languages,
    verifiedLanguages: toDisplayLanguages(source?.verifiedLanguages),
    introductionVideo: getAssetUrl(source?.introductionVideo),
  };
};

function RatingStars({ value }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(value)
              ? "fill-[#EDC84C] text-[#EDC84C]"
              : "text-[#d7d6e8]"
          }`}
        />
      ))}
    </div>
  );
}

function StatItem({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center gap-4">
      <Icon className="size-9 text-[var(--maincolor)] shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="text-sm text-[var(--lighttext)] tracking-[3px] uppercase">
          {label}
        </p>
        <p className="font-semibold text-2xl text-[var(--maincolor)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-base font-medium text-[var(--maintaxt)]">
      <Icon className="h-5 w-5 text-[var(--maincolor)] shrink-0" />
      <span className="text-sm text-[var(--lighttext)] uppercase tracking-[2px] mr-1">
        {label}:
      </span>
      <span>{value}</span>
    </div>
  );
}

export default function GuideDetailsPage() {
  const { guideId } = useParams();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadGuide = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await guidesApi.getPublicGuide(guideId);
        if (!isMounted) return;
        setGuide(mapGuide(result));
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message ?? "Failed to load guide details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadGuide();

    return () => {
      isMounted = false;
    };
  }, [guideId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <GuideNavbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-10 h-10 border-4 border-[var(--maincolor)] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <GuideNavbar />
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <div className="text-center flex flex-col gap-4">
            <p className="text-red-600 text-sm">{error}</p>
            <Link
              to="/guides"
              className="text-sm text-[var(--maincolor)] underline inline-flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to guides
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!guide) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <GuideNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {/* Back link */}
        <Link
          to="/guides"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--maincolor)] hover:underline mb-8"
        >
          <ArrowLeft size={14} /> Back to all guides
        </Link>

        {/* ── Profile header ── */}
        <section className="grid gap-8 md:grid-cols-[190px_1fr] md:items-start">
          <div className="relative mx-auto h-44 w-44 md:mx-0">
            {guide.photo ? (
              <img
                src={guide.photo}
                alt={guide.fullName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center rounded-full bg-[#eeeeF6] text-[#8b89a8]">
                <UserRound className="h-16 w-16" strokeWidth={1.25} />
              </div>
            )}
            {guide.rating > 0 && (
              <span className="absolute -bottom-1 -right-1 grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-[#010138] text-[#EDC84C] shadow-lg">
                <BadgeCheck className="h-6 w-6" />
              </span>
            )}
          </div>

          <div>
            <div className="flex flex-col gap-2">
              {guide.fullName && (
                <h1 className="text-3xl font-bold sm:text-4xl text-[var(--maintaxt)]">
                  {guide.fullName}
                </h1>
              )}
              {guide.rating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[var(--maintaxt)]">
                      {guide.rating}
                    </span>
                    <RatingStars value={guide.rating} />
                  </div>
                  <span className="text-sm text-[#353572]">
                    {guide.reviewCount} review
                    {guide.reviewCount !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
              {guide.experience && (
                <DetailRow
                  icon={Sparkles}
                  label="Experience"
                  value={guide.experience}
                />
              )}
              {guide.nationality && (
                <DetailRow
                  icon={MapPin}
                  label="From"
                  value={guide.nationality}
                />
              )}
              {guide.languages.length > 0 && (
                <DetailRow
                  icon={Languages}
                  label="Languages"
                  value={guide.languages.join(" · ")}
                />
              )}
            </div>
          </div>
        </section>

        {/* ── Stats row ── */}
        <section className="mt-10 flex flex-wrap gap-10">
          <StatItem
            icon={Star}
            label="Rating"
            value={guide.rating > 0 ? `${guide.rating} / 5` : null}
          />
          <StatItem
            icon={BadgeCheck}
            label="Reviews"
            value={guide.reviewCount > 0 ? guide.reviewCount : null}
          />
          <StatItem
            icon={Globe}
            label="Nationality"
            value={guide.nationality || null}
          />
        </section>

        {/* ── About / Bio ── */}
        {guide.bio && (
          <section className="mt-10">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--maintaxt)]">
              About
            </h2>
            <p className="mt-3 max-w-5xl whitespace-pre-line text-base leading-7 text-[#353572]">
              {guide.bio}
            </p>
          </section>
        )}

        {/* ── Specialties / Interests ── */}
        {guide.interests.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--maintaxt)]">
              Specialties
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {guide.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-[var(--maincolor)] px-6 py-2 text-sm font-medium text-white"
                >
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Verified languages ── */}
        {guide.verifiedLanguages.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--maintaxt)]">
              Verified languages
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {guide.verifiedLanguages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-2 rounded-full bg-[#eefbdc] px-5 py-2 text-sm font-semibold text-[#41651f]"
                >
                  <BadgeCheck className="h-4 w-4" />
                  {lang}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Introduction video ── */}
        {guide.introductionVideo && (
          <section className="mt-10">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--maintaxt)]">
              Video introduction
            </h2>
            <video
              controls
              preload="metadata"
              className="mt-5 aspect-video w-full max-w-2xl rounded-2xl border border-[#EDC84C] bg-[var(--maincolor)] object-cover"
            >
              <source src={guide.introductionVideo} />
            </video>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
