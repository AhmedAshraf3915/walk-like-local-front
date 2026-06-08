import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({ show = false, onToggle, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center justify-center rounded-md p-1.5 text-[#010170] transition hover:bg-[#010170]/5 ${className}`}
    >
      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );
};

export default PasswordInput;
