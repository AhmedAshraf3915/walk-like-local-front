import authBackground from "../../assets/images/auth-bg.jpg";
import AuthTabs from "../shared/AuthTabs";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <main className="relative min-h-screen overflow-hidden text-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBackground})` }}
      />

      <div className="relative z-10 grid min-h-screen place-items-center p-4 sm:p-6 lg:p-8">
        <section className="w-full max-w-135 rounded-[28px] border border-white/25 bg-white/20 px-6 py-8 shadow-[0_28px_80px_rgba(12,18,52,0.24)] backdrop-blur-[10px] sm:px-8 sm:py-10">
          <header className="flex flex-col items-center text-center">
            <div className="mb-4 min-h-4 w-full" />

            {title ? (
              <h1
                id="auth-layout-title"
                className="text-[clamp(1.7rem,2.8vw,2.25rem)] font-extrabold leading-tight tracking-tight text-[#010170]"
              >
                {title}
              </h1>
            ) : null}

            {subtitle ? (
              <p className="mt-3 max-w-100 text-[0.98rem] leading-6 text-[#010170]">
                {subtitle}
              </p>
            ) : null}
          </header>


          <div className="mt-6">
            <AuthTabs />   
          </div>

          <div className="mt-7 flex flex-col gap-4">{children}</div>

          <footer className="mt-6" />
        </section>
      </div>
    </main>
  );
};

export default AuthLayout;
