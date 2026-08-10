const GithubIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .28.18.61.69.5A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
  </svg>
);
const InstagramIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.24 8.25h4.5V23H.24V8.25Zm7.6 0h4.31v2.02h.06c.6-1.14 2.07-2.34 4.26-2.34 4.55 0 5.39 3 5.39 6.9V23h-4.5v-6.68c0-1.6-.03-3.65-2.22-3.65-2.23 0-2.57 1.74-2.57 3.54V23h-4.5V8.25Z" />
  </svg>
);

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/team-Triada", Icon: GithubIcon },
  { label: "Instagram", href: "https://www.instagram.com/team_triada/", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://in.linkedin.com/company/teamtriada", Icon: LinkedinIcon },
];

export default function Footer() {
  return (
    <>
      <footer style={{ background: "#08090b", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, #ff3c3c 30%, #ff6040 60%, transparent 100%)" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 28px 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <a href="https://triada.in" aria-label="TRIADA home" style={{ display: "inline-block", textDecoration: "none" }}>
                <img
                  src="/images/Triada_typo.png"
                  alt="TRIADA"
                  style={{ height: 20, width: "auto", filter: "brightness(0) invert(1)" }}
                />
              </a>
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#7a8190", maxWidth: 320, margin: 0 }}>
                Cybersecurity headlines, summarized. A side project by TRIADA, India&apos;s CTF team.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#7a8190",
                    }}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#3a4250", textTransform: "uppercase" }}>
                Contact
              </div>
              <a href="mailto:triadactf@gmail.com" style={{ fontSize: 13.5, color: "#7a8190", textDecoration: "none" }}>
                triadactf@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
      <div style={{ background: "#08090b", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "14px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 10,
          fontSize: 11, color: "#5a6270",
          letterSpacing: "0.06em",
        }}>
          <span>© 2026 TRIADA. All Rights Reserved.</span>
          <span style={{
            background: "linear-gradient(90deg, #ff3c3c, #ff8040)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            built for the community
          </span>
        </div>
      </div>
    </>
  );
}
