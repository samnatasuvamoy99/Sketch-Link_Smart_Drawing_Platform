import { Card, CardLabel, CardTitle, CardDescription } from "@repo/ui";

const FEATURES = [
  { icon: "⬡", title: "Real-Time Collaboration",   sub: "Zero-latency sync",    desc: "Every stroke appears instantly across all connected sessions. CRDT-based conflict resolution — no merge conflicts, ever." },
  { icon: "◈", title: "AI Visual Describer",       sub: "Powered by Claude",    desc: "One click. The AI reads your canvas and returns a rich contextual description of shapes, intent, and emotion." },
  { icon: "◐", title: "Smart Messaging",           sub: "Context-aware chat",   desc: "Thread discussions directly onto canvas objects. Mention teammates, attach sketches, keep context locked to the drawing." },
  { icon: "◧", title: "Version Snapshots",         sub: "Time-travel your art", desc: "Every session auto-saved. Rewind to any point. Fork a snapshot into a new canvas. Your creative history, intact." },
  { icon: "⬟", title: "Smart Templates",           sub: "Start with structure", desc: "Wireframes, mind maps, flowcharts, storyboards. 40+ templates or generate one from a text prompt in seconds." },
  { icon: "◉", title: "Infinite Canvas",           sub: "No boundaries",        desc: "Pan endlessly. Zoom from pixel to poster. Freeform zones or structured grid — you decide the shape of your thinking." },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
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
        {/* ── Header ── */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 64,
          }}
        >
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "var(--gold-600)",
              display: "block",
              marginBottom: 14,
            }}
          >
           
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 4.5vw, 62px)",
              fontWeight: 900,
              color: "var(--text-primary)",
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Everything your team
            <br />
            <span className="gradient-text">needs to draw together.</span>
          </h2>
        </div>

        {/* ── Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "rgba(0,0,0,0.07)",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {FEATURES.map((f, i) => (
            <Card
              key={i}
              variant="feature"
              hoverable
              padding="lg"
              style={{
                borderRadius: 0,
                border: "none",
                background: "var(--bg-secondary)",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  color: "var(--gold-600)",
                  marginBottom: 16,
                  lineHeight: 1,
                }}
              >
                {f.icon}
              </div>
              <CardLabel>{f.sub}</CardLabel>
              <CardTitle>{f.title}</CardTitle>
              <CardDescription>{f.desc}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
