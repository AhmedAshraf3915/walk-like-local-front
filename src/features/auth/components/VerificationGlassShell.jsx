import authBackground from "../../../assets/images/auth-bg.jpg";

const VerificationGlassShell = ({ children, cardClassName = "" }) => {
  return (
    <main className="relative min-h-screen overflow-hidden text-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBackground})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 grid min-h-screen place-items-center p-4 sm:p-6 lg:p-8">
        <section
          className={`w-full max-w-135 rounded-[28px] border border-white/25 bg-white/20 px-6 py-8 shadow-[0_28px_80px_rgba(12,18,52,0.24)] backdrop-blur-[10px] sm:px-8 sm:py-10 ${cardClassName}`}
        >
          {children}
        </section>
      </div>
    </main>
  );
};

export default VerificationGlassShell;
