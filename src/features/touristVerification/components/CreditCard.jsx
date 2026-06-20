import { ICONS } from "../../../assets/images/touristVerification/images.js";


const cardWorldMap = ICONS.cardWorldMap;
const cardChip     = ICONS.cardChip;
const visaLogo     = ICONS.visaLogo;

export function CreditCard() {
  return (
    <div
      className="relative w-[320px] sm:w-[360px] lg:w-[400px] h-[200px] sm:h-[220px] lg:h-[254px] rounded-2xl sm:rounded-3xl overflow-hidden shrink-0"
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
        className="absolute top-0 left-4 w-[84%] opacity-20 pointer-events-none select-none"
      />

      {/* Card content */}
      <div className="absolute inset-0 p-4 sm:p-5 lg:p-7 flex flex-col justify-between">
        {/* Top row */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-white/90 text-[11px] sm:text-sm font-medium">Credit card</span>
            {/* Chip */}
            <img src={cardChip} alt="chip" className="w-7 h-6 sm:w-8 sm:h-7 lg:w-10 lg:h-8 mt-1.5 sm:mt-2 object-contain" />
          </div>
          <span className="text-xs sm:text-sm lg:text-base font-bold" style={{ color: "#010170", fontFamily: "Impact, sans-serif" }}>
            <span style={{ color: "#010170" }}>Money</span>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>Bank</span>
          </span>
        </div>

        {/* Card number */}
        <div className="text-white text-sm sm:text-base lg:text-xl tracking-widest">
          **** **** **** 6789
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/90 text-[11px] sm:text-sm">Jeffrey Richardson</p>
          </div>
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="text-center">
              <p className="text-white/60 text-[7px] sm:text-[9px]">Valid Till</p>
              <p className="text-white text-[10px] sm:text-xs">09/25</p>
            </div>
            {/* Oval / visa-style mark */}
            <div className="flex items-center justify-center">
              <img src={visaLogo} alt="visa" className="h-4 sm:h-5 lg:h-6 object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Oval chip decoration */}
      <div className="absolute bottom-6 right-8 w-8 h-5 sm:w-10 sm:h-6 lg:w-12 lg:h-7 rounded-full bg-[#cccce2]/50 border border-white/50" />
    </div>
  );
}
