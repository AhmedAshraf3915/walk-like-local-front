function StarRow({ stars }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={i < stars ? "#EDC84C" : "none"}
          stroke="#EDC84C"
          strokeWidth="1.5"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialCard({ review }) {
  const { text, name, country, stars, avatar } = review;

  return (
    <div
      className="flex flex-col gap-4 bg-[#F4F4F8] p-5 shadow-[4px_6px_18px_rgba(1,1,112,0.12)]"
      style={{
        borderRadius: "20px 6px 20px 6px",
        border: "1px solid rgba(170,170,207,0.5)",
      }}
    >
      {/* Decorative quote */}
      <div
        className="self-end text-3xl font-bold leading-none text-[#010170]/20"
        aria-hidden="true"
        style={{ fontFamily: "Georgia, serif" }}
      >
        &ldquo;
      </div>

      {/* Quote text */}
      <p className="text-[11px] leading-[1.7] text-[#010138]">
        &ldquo;{text}&rdquo;
      </p>

      {/* Author row */}
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#CCCCE2]">
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#010170]">{name}</p>
            <p className="mt-0.5 text-[9px] text-[#AAAACF]">{country}</p>
          </div>
        </div>
        <StarRow stars={stars} />
      </div>
    </div>
  );
}
