const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  id,
  leftIcon,
  rightSlot,
  containerClassName = "",
  inputClassName = "",
  ...rest
}) => {
  return (
    <div
      className={`flex h-11 items-center gap-2 rounded-md border border-[#010170]/20 bg-white/85 px-3 shadow-sm backdrop-blur-sm ${containerClassName}`}
    >
      {leftIcon ? (
        <span className="shrink-0 text-[#BE9D46]">{leftIcon}</span>
      ) : null}

      <input
        id={id}
        className={`min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[#010170] placeholder:text-[#010170]/50 focus:outline-none focus:ring-0 ${inputClassName}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        {...rest}
      />

      {rightSlot ? <span className="shrink-0">{rightSlot}</span> : null}
    </div>
  );
};

export default Input;
