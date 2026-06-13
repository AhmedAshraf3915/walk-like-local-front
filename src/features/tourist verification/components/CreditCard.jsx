// Reusable card visual matching the Figma design
const cardWorldMap = "https://www.figma.com/api/mcp/asset/322d9521-7e06-47d5-8eb7-e80e464fcbf3";
const cardChip     = "https://www.figma.com/api/mcp/asset/5a746f57-01e0-407b-b1b7-49ed037b3f79";
const visaLogo     = "https://www.figma.com/api/mcp/asset/28df6aa5-f195-4fe0-b2d9-92d9d6c409e2";

export function CreditCard() {
  return (
    <div
      className="relative w-[400px] h-[254px] rounded-3xl overflow-hidden shrink-0"
      style={{
        background: "linear-gradient(to right, #010170, #edc84c)",
        boxShadow:
          "-8px 8px 24px rgba(1,1,56,0.25), 0 158px 591px rgba(0,0,0,0.10), 0 57px 215px rgba(0,0,0,0.08), 0 28px 104px rgba(0,0,0,0.06)",
      }}
    >
      {/* World map watermark */}
      <img
        src={cardWorldMap}
        alt=""
        className="absolute top-0 left-6 w-[84%] opacity-20 pointer-events-none select-none"
      />

      {/* Card content */}
      <div className="absolute inset-0 p-7 flex flex-col justify-between">
        {/* Top row */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-white/90 text-sm font-medium">Credit card</span>
            {/* Chip */}
            <img src={cardChip} alt="chip" className="w-10 h-8 mt-3 object-contain" />
          </div>
          <span className="text-base font-bold" style={{ color: "#010170", fontFamily: "Impact, sans-serif" }}>
            <span style={{ color: "#010170" }}>Money</span>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>Bank</span>
          </span>
        </div>

        {/* Card number */}
        <div className="text-white text-xl tracking-widest">
          **** **** **** 6789
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/90 text-sm">Jeffrey Richardson</p>
          </div>
          <div className="flex items-end gap-4">
            <div className="text-center">
              <p className="text-white/60 text-[9px]">Valid Till</p>
              <p className="text-white text-xs">09/25</p>
            </div>
            {/* Oval / visa-style mark */}
            <div className="flex items-center justify-center">
              <img src={visaLogo} alt="visa" className="h-6 object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Oval chip decoration */}
      <div className="absolute bottom-8 right-10 w-12 h-7 rounded-full bg-[#cccce2]/50 border border-white/50" />
    </div>
  );
}
