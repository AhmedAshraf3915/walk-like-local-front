const Button = ({
  children,
  type = "button",
  disabled = false,
  onClick,
  className = "",
  variant = "primary",
  fullWidth = false,
  ...buttonProps
}) => {
  const variants = {
    primary:
      "bg-linear-to-r from-[#010170] to-[#5656A0] text-white shadow-[0_14px_30px_rgba(1,1,112,0.22)] hover:from-[#00005A] hover:to-[#2B2B88] hover:shadow-[0_18px_34px_rgba(1,1,112,0.32)] hover:-translate-y-0.5",
    secondary:
      "border border-[#010170]/20 bg-white/95 text-[#010170] shadow-sm",
    ghost: "bg-transparent text-[#010170]",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      {...buttonProps}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition hover:opacity-95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#010170]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 ${variants[variant] ?? variants.primary} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
