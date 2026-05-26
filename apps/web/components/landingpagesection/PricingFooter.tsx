import { Button, Card, CardLabel } from "@repo/ui";

const PLANS = [
  {
    name: "SketchLink",
    price: "Free",
    period: "",
    desc: "Perfect for solo creatives",
    features: ["3 canvases", "2 collaborators", "AI descriptions (10/mo)", "1 GB storage", "Community support"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Studio",
    price: "$12",
    period: "/mo",
    desc: "For growing teams",
    features: ["Unlimited canvases", "15 collaborators", "AI descriptions (unlimited)", "50 GB storage", "Priority support", "Version history", "Custom templates"],
    cta: "Start Studio",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large organizations",
    features: ["Unlimited everything", "SSO & SAML", "Custom AI fine-tuning", "Dedicated support", "SLA guarantee", "On-premise option", "API access"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const FOOTER_LINKS = [
  { title: "Product",  links: ["Features", "Templates", "Changelog", "Roadmap", "Integrations"] },
  { title: "Company",  links: ["About", "Blog", "Careers", "Press", "Contact"] },
  { title: "Legal",    links: ["Privacy", "Terms", "Security", "Cookie Policy", "GDPR"] },
];

export function PricingFooter() {
  return (
    <>
      {/* ── PRICING ── */}
      <section
        id="pricing"
        className="section"
        style={{
          padding: "96px 0",
          background: "var(--bg-secondary)",
        }}
      >
        <div className="grid-bg" />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 40px",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--gold-600)", display: "block", marginBottom: 14 }}>
             
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(32px,4.5vw,60px)",
                fontWeight: 900,
                color: "var(--text-primary)",
                lineHeight: 1.05,
                letterSpacing: "-2px",
                marginBottom: 14,
              }}
            >
              Simple pricing.
              <br />
              <span className="gradient-text">Powerful results.</span>
            </h2>
            <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, fontStyle: "italic", color: "var(--text-secondary)" }}>
              No hidden fees. Cancel anytime. Start sketching in 30 seconds.
            </p>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 22,
              alignItems: "center",
            }}
          >
            {PLANS.map((plan, i) => (
              <Card
                key={i}
                variant={plan.highlight ? "gold" : "default"}
                hoverable
                padding="lg"
                style={{
                  position: "relative",
                  transform: plan.highlight ? "translateY(-12px)" : "none",
                  boxShadow: plan.highlight
                    ? "0 10px 48px rgba(200,134,10,0.14)"
                    : "var(--shadow-sm)",
                }}
              >
                {plan.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: -14,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg,#FFD700,#C8860A)",
                      color: "#fff",
                      borderRadius: 100,
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "4px 16px",
                      boxShadow: "0 2px 12px rgba(200,134,10,0.28)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <CardLabel>{plan.name}</CardLabel>

                <div style={{ marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 48,
                      fontWeight: 900,
                      color: plan.highlight ? "var(--gold-600)" : "var(--text-primary)",
                      letterSpacing: "-2px",
                      lineHeight: 1,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "var(--text-muted)" }}>
                    {plan.period}
                  </span>
                </div>

                <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 13, fontStyle: "italic", color: "var(--text-secondary)", marginBottom: 22 }}>
                  {plan.desc}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 9, alignItems: "center" }}>
                      <span style={{ color: plan.highlight ? "var(--gold-600)" : "var(--gold-500)", fontSize: 12, fontWeight: 700 }}>✓</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-secondary)" }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={plan.highlight ? "primary" : "outline"}
                  size="md"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#111",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1280,
            margin: "0 auto",
            padding: "72px 40px 32px",
          }}
        >
          {/* Top grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 48,
              marginBottom: 56,
            }}
          >
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#FFD700,#C8860A)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 18, color: "#fff" }}>S</div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 16, color: "#fff" }}>𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔</span>
              </div>
              <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 14, fontStyle: "italic", color: "rgba(255,255,255,0.28)", lineHeight: 1.8, maxWidth: 280, marginBottom: 20 }}>
                The smart drawing platform where teams think visually, collaborate in real time, and let AI illuminate their ideas.
              </p>
              <div style={{ display: "flex", gap: 9 }}>
                {["𝕏", "in", "gh", "yt"].map((s, i) => (
                  <div
                    key={i}
                    style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.32)", cursor: "pointer" }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_LINKS.map((col, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#E6A800", marginBottom: 16 }}>
                  {col.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l, j) => (
                    <a
                      key={j}
                      href="#"
                      style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.28)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#E6A800")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
                    >
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 22,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.18)" }}>
              © 2025 𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔 Inc. All rights reserved. 𝐃𝐞𝐯𝐒𝐮𝐯𝐚𝐦𝐨𝐲
            </span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ width: 6, height: 6, background: "#E6A800", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 6px #E6A800", animation: "pulse-dot 1.5s infinite" }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.18)" }}>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
