import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";


export function Eyebrow({ children }) {
  return (
    <span
      className="uppercase tracking-[3px] font-medium"
      style={{ fontSize: "11px", color: "#EDC84C", fontFamily: "'Instrument Sans', sans-serif" }}
    >
      {children}
    </span>
  );
}

export function SectionHeading({ children, light = false }) {
  return (
    <h2
      className="font-bold leading-tight"
      style={{ fontSize: "clamp(22px,2.3vw,30px)", color: light ? "#fff" : "#010138" }}
    >
      {children}
    </h2>
  );
}

export function SectionSub({ children, light = false }) {
  return (
    <p
      className="font-medium leading-snug"
      style={{ fontSize: "clamp(12px,1.2vw,15px)", color: light ? "#CCCCE2" : "#353572" }}
    >
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  sub,
  action,
  actionHref,
  light = false,
}) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end md:mb-7">
      <div className="flex max-w-2xl flex-col gap-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <SectionHeading light={light}>{title}</SectionHeading>
        {sub && <SectionSub light={light}>{sub}</SectionSub>}
      </div>
      {action && (
        <LinkArrow href={actionHref} light={light}>
          {action}
        </LinkArrow>
      )}
    </div>
  );
}

export function LinkArrow({ children, href = "#", light = false }) {
  const className =
    "flex items-center gap-2 font-medium whitespace-nowrap hover:opacity-75 transition-opacity";
  const style = { fontSize: "12px", color: light ? "#CCCCE2" : "#353572" };

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} style={style}>
        {children}
        <ArrowRight size={20} />
      </a>
    );
  }

  return (
    <Link to={href} className={className} style={style}>
      {children}
      <ArrowRight size={20} />
    </Link>
  );
}

export function PrimaryButton({ children, className = "", style = {}, to = "#" }) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-center gap-2 rounded-xl font-semibold text-white whitespace-nowrap transition-opacity hover:opacity-90 ${className}`}
      style={{
        background: "linear-gradient(90deg, #010170, #5656A0)",
        boxShadow: "0 4px 4px rgba(1,1,56,0.2)",
        padding: "9px 24px",
        fontSize: "12px",
        ...style,
      }}
    >
      {children}
    </Link>
  );
}

export function OutlineButton({ children, className = "", style = {}, to = "#" }) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-center rounded-xl font-medium whitespace-nowrap transition-opacity hover:opacity-80 ${className}`}
      style={{
        border: "1.5px solid #010170",
        background: "transparent",
        color: "#010138",
        padding: "8px 22px",
        fontSize: "12px",
        boxShadow: "0 4px 4px rgba(1,1,56,0.15)",
        ...style,
      }}
    >
      {children}
    </Link>
  );
}

export function StarRating({ value = "4.2", count = "8" }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#EDC84C">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
      <span className="font-medium" style={{ fontSize: "11px", color: "#010170" }}>
        {value} ({count})
      </span>
    </div>
  );
}
