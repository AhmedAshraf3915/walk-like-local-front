import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import GuideNavbar from "@/components/home/GuideNavbar.jsx";
import HeroSection from "@/components/home/HeroSection.jsx";
import GuideCard from "@/components/home/GuideCard.jsx";
import Footer from "@/components/home/Footer.jsx";

import { guidesApi } from "@/features/guide/api/guidesApi.js";
import { mapPublicGuides } from "@/features/landingPage/utils/landingContentMappers.js";

// ─── Shared primitives ────────────────────────────────────────────────────────

function Eyebrow({ children }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#EDC84C]">
      {children}
    </span>
  );
}

function SectionHeader({ eyebrow, title, sub, actionLabel, actionHref = "#" }) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-tight text-[#010138]">
          {title}
        </h2>
        {sub && (
          <p className="text-[clamp(12px,1.2vw,14px)] leading-relaxed text-[#353572]">
            {sub}
          </p>
        )}
      </div>
      {actionLabel && (
        <a
          href={actionHref}
          className="flex flex-shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#353572] transition-opacity hover:opacity-70"
        >
          {actionLabel} <ArrowRight size={16} />
        </a>
      )}
    </div>
  );
}

function CardSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="h-[430px] animate-pulse rounded-2xl bg-[#eeeeF6]"
        />
      ))}
    </div>
  );
}

function ContentMessage({ children, tone = "empty" }) {
  return (
    <div
      className={`rounded-2xl border px-5 py-8 text-center text-sm ${
        tone === "error"
          ? "border-[#efc2c2] bg-[#fff5f5] text-[#8f2929]"
          : "border-[#e4e3f0] bg-[#f8f8fc] text-[#65638a]"
      }`}
    >
      {children}
    </div>
  );
}

// ─── Section: Guides ──────────────────────────────────────────────────────────

function GuidesSection({ guides, isLoading, errorMessage }) {
  return (
    <section id="guides" className="bg-[#FDFDFF] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Guides"
          title="Meet your locals."
          sub="Verified, story-rich and ready to walk you through their Egypt."
        />

        {isLoading ? <CardSkeletons /> : null}
        {!isLoading && errorMessage && guides.length === 0 ? (
          <ContentMessage tone="error">{errorMessage}</ContentMessage>
        ) : null}
        {!isLoading && !errorMessage && guides.length === 0 ? (
          <ContentMessage>
            No public guide profiles are available yet.
          </ContentMessage>
        ) : null}
        {!isLoading && guides.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ViewAllGuidePage() {
  const [content, setContent] = useState({
    guides: [],
    guidesLoading: true,
    guidesError: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadGuides = async () => {
      const result = await guidesApi.getPublicGuides({ page: 1, limit: 12 });

      if (!isMounted) return;

      try {
        const guides = mapPublicGuides(result);
        setContent({
          guides,
          guidesLoading: false,
          guidesError: "",
        });
      } catch (error) {
        setContent({
          guides: [],
          guidesLoading: false,
          guidesError: error?.message ?? "Unable to load public guides.",
        });
      }
    };

    loadGuides().catch((error) => {
      if (!isMounted) return;
      setContent({
        guides: [],
        guidesLoading: false,
        guidesError: error?.message ?? "Unable to load public guides.",
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="overflow-x-hidden">
      <GuideNavbar />
      <HeroSection />
      <GuidesSection
        guides={content.guides}
        isLoading={content.guidesLoading}
        errorMessage={content.guidesError}
      />
      <Footer />
    </div>
  );
}
