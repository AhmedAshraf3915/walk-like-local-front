import { IMG } from "../../../assets/images/landingPage/images.js";

export default function Footer() {
  return (
    <footer
      className="px-4 py-8 sm:px-6 md:py-10"
      style={{ background: "#010138" }}
    >
      <div className="mx-auto max-w-6xl">
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {/* Brand col */}
        <div className="flex flex-col gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
           <img src={IMG.WLLLogo} alt="Walk Like A Local" className="h-7 w-7" />

            <span className="text-sm font-bold tracking-wide text-white">Walk Like A Local</span>
          </div>

          <p style={{ fontSize: "10px", color: "#CCCCE2", lineHeight: 1.7 }}>
            Authentic Egyptian travel, hosted by the people who call it home.
          </p>

          <div className="flex flex-col gap-3">
            <p
              className="font-semibold"
              style={{ fontSize: "10px", color: "#F4F4F8", lineHeight: 1.5, maxWidth: "480px" }}
            >
              "Enjoy the beauty of Egypt… Explore with Clarity"
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="hover:opacity-75 transition-opacity">
                <img src={IMG.facebook} alt="Facebook" width={18} height={18} />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:opacity-75 transition-opacity">
                <img src={IMG.linkedin} alt="LinkedIn" width={18} height={18} />
              </a>
              <a href="#" aria-label="Instagram" className="hover:opacity-75 transition-opacity">
                <img src={IMG.instagram} alt="Instagram" width={18} height={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Links col */}
        <div className="flex flex-col gap-4 pl-0 md:pl-10">
          <h3 className="font-bold text-white" style={{ fontSize: "17px" }}>
            Quick Links
          </h3>

          <FooterGroup
            title="Support:"
            body="Available 24/7 to assist you throughout your journey."
          />
          <FooterGroup
            title="Our Services:"
            body="Explore | Places | AI recommendation Tours | Guides"
            link
          />
          <FooterGroup
            title="Terms & Conditions:"
            body="Booking and cancellation policies to protect your rights."
          />
          <FooterGroup
            title="Email:"
            body="info@walklikealocal.com"
          />
        </div>
      </div>

      {/* Divider + copyright */}
      <div
        className="pt-8 text-center font-semibold"
        style={{
          borderTop: "1px solid #CCCCE2",
          fontSize: "10px",
          color: "#F4F4F8",
        }}
      >
        © 2026 Local Egypt. All rights reserved.
      </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, body, link = false }) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="font-semibold"
        style={{ fontSize: "11px", color: "#F4F4F8" }}
      >
        {title}
      </span>
      {link ? (
        <a
          href="#"
          style={{ fontSize: "10px", color: "#CCCCE2", lineHeight: 1.65, textDecoration: "underline" }}
        >
          {body}
        </a>
      ) : (
        <p style={{ fontSize: "10px", color: "#CCCCE2", lineHeight: 1.65 }}>
          {body}
        </p>
      )}
    </div>
  );
}
