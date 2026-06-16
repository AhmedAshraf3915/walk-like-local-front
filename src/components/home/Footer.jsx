import { Link } from "react-router-dom";
import { IMG } from "@/assets/images/landingPage/images.js";

const QUICK_LINKS = [
  {
    title: "Support:",
    body: "Available 24/7 to assist you throughout your journey.",
    isLink: false,
  },
  {
    title: "Our Services:",
    body: "Explore | Places | AI recommendation Tours | Guides",
    isLink: true,
    href: "#",
  },
  {
    title: "Terms & Conditions:",
    body: "Booking and cancellation policies to protect your rights.",
    isLink: false,
  },
  {
    title: "Email:",
    body: "info@walklikelocal.com",
    isLink: false,
  },
];

const SOCIAL_LINKS = [
  { label: "Facebook", img: IMG.facebook, href: "#" },
  { label: "LinkedIn", img: IMG.linkedin, href: "#" },
  { label: "Instagram", img: IMG.instagram, href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#010138] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={IMG.WLLLogo}
                alt="Walk Like A Local"
                className="h-7 w-7"
              />
              <span className="text-sm font-bold tracking-wide text-white">
                Walk Like A Local
              </span>
            </Link>

            <p className="text-[10px] leading-[1.7] text-[#CCCCE2]">
              Authentic Egyptian travel, hosted by the people who call it home.
            </p>

            <p className="max-w-xs text-[10px] font-semibold leading-snug text-[#F4F4F8]">
              "Enjoy the beauty of Egypt… Explore with Clarity"
            </p>

            {/* Social */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="opacity-80 transition-opacity hover:opacity-100"
                >
                  <img
                    src={social.img}
                    alt={social.label}
                    className="h-[18px] w-[18px]"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links column */}
          <div className="flex flex-col gap-5 md:pl-8">
            <h3 className="text-[17px] font-bold text-white">Quick Links</h3>

            <div className="flex flex-col gap-4">
              {QUICK_LINKS.map((item) => (
                <div key={item.title} className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-[#F4F4F8]">
                    {item.title}
                  </span>
                  {item.isLink ? (
                    <a
                      href={item.href}
                      className="text-[10px] leading-[1.65] text-[#CCCCE2] underline underline-offset-2 hover:text-white transition-colors"
                    >
                      {item.body}
                    </a>
                  ) : (
                    <p className="text-[10px] leading-[1.65] text-[#CCCCE2]">
                      {item.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="border-t border-[#CCCCE2]/30 pt-6 text-center text-[10px] font-semibold text-[#F4F4F8]">
          © 2026 Local Egypt. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
