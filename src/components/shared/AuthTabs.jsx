import { Link, useLocation } from "react-router-dom";

const AuthTabs = () => {
  const { pathname } = useLocation();

  return (
    <div
      className="flex rounded-xl overflow-hidden mb-6"
      style={{
        background: "rgba(255,255,255,0.35)",
        border: "1px solid rgba(255,255,255,0.4)",
      }}
    >
      <Link
        to="/signup"
        className={`flex-1 h-[44px] text-sm font-semibold rounded-xl flex items-center justify-center transition-all duration-200 ${
          pathname === "/signup"
            ? "bg-white text-[#010170] shadow-sm"
            : "text-[#010170]/70 hover:text-[#010170]"
        }`}
      >
        Sign Up
      </Link>
      <Link
        to="/login"
        className={`flex-1 h-[44px] text-sm font-semibold rounded-xl flex items-center justify-center transition-all duration-200 ${
          pathname === "/login"
            ? "bg-white text-[#010170] shadow-sm"
            : "text-[#010170]/70 hover:text-[#010170]"
        }`}
      >
        Log In
      </Link>
    </div>
  );
};

export default AuthTabs;