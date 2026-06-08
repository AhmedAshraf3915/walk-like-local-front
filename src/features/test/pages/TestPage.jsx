import { Link } from "react-router-dom";

const TestPage = () => {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-4 text-[#010170]">
      <section className="w-full max-w-xl rounded-[28px] border border-[#010170]/10 bg-white px-6 py-8 text-center shadow-[0_24px_60px_rgba(12,18,52,0.14)] sm:px-10">
        <p className="text-sm font-bold uppercase tracking-wider text-[#BE9D46]">
          Test page
        </p>
        <h1 className="mt-3 text-3xl font-extrabold">
          Authentication flow reached the next page.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#010170]/75">
          Use this page as the temporary destination while testing login, Google
          auth, and email verification.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-md border border-[#010170]/20 bg-white px-4 py-3 text-sm font-semibold text-[#010170] shadow-sm"
          >
            Back to signup
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-md bg-linear-to-r from-[#010170] to-[#5656A0] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(1,1,112,0.22)]"
          >
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
};

export default TestPage;
