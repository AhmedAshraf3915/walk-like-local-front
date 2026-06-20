import { ArrowRight} from "lucide-react";

import Navbar from "@/components/home/Navbar.jsx";
import HeroSection from "@/components/home/HeroSection.jsx";
import GuideCard from "@/components/home/GuideCard.jsx";
import Footer from "@/components/home/Footer.jsx";

import {
  GUIDES
} from "@/data/homeData.js";
import { IMG } from "@/assets/images/landingPage/images.js";

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

// ─── Section: Guides ──────────────────────────────────────────────────────────

function GuidesSection() {
  return (
    <section id="all-guides" className="bg-[#FDFDFF] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="EXPERT INSIDERS"
          title="Meet the Local Experts."
          sub="Verified, story-rich and ready to walk you through their Egypt."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </div>
    </section>
  );
}




export default function ViewAllGuidePage() {
  return (
        <div className="overflow-x-hidden bg-[#FDFDFF]">
          <Navbar />
          <HeroSection />
          {/* filters */}
          <GuidesSection />
          <Footer />
        </div>
  )
}
