export default function FeatureCard({ feature }) {
  const { icon: Icon, title, body } = feature;

  return (
    <div className="flex min-h-[165px] flex-col gap-4 rounded-2xl bg-gradient-to-br from-[#151571] to-[#2e2e7e] p-5 shadow-[0_8px_24px_rgba(10,10,80,0.3)]">
      {/* Icon badge */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(170,170,207,0.25)]">
        <Icon size={16} className="text-[#EDC84C]" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold text-white">{title}</h3>
        <p className="text-[11px] leading-[1.65] text-[#AAAACF]">{body}</p>
      </div>
    </div>
  );
}
