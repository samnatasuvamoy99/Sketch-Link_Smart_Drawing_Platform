"use client";
import { useState } from "react";
import { Button, Badge, Card } from "@repo/ui";
import { LiveSketchCanvas } from "@repo/ui";
import { useTypewriter } from "@/hooks/UseTypewriter";
import { askClaude } from "@/lib/Anthropic";

const TYPEWRITER_TEXTS = [
  "Draw Together.",
  "Think Visually.",
  "Build Faster.",
  "Ship Ideas.",
];

const AVATARS = [
  { label: "A", bg: "#FFD700" },
  { label: "M", bg: "#E6A800" },
  { label: "J", bg: "#C8860A" },
  { label: "K", bg: "#A66800" },
];

export function HeroSection() {
  const typed = useTypewriter(TYPEWRITER_TEXTS);
  const [aiText,    setAiText]    = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiShown,   setAiShown]   = useState(false);

  const handleDescribe = async () => {
    setAiShown(true);
    setAiLoading(true);
    setAiText("");
    try {
      const reply = await askClaude([
        {
          role: "user",
          content:
            "You are the AI inside  𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔 , a smart drawing platform. A user clicked 'AI Describe'. Describe a rich imaginary sketch on a warm cream canvas — flowing curves, geometric tension, warm golden strokes — as if analyzing it live. Be poetic, precise, insightful. 3–4 sentences.",
        },
      ]);
      setAiText(reply);
    } catch {
      setAiText(
        "Sweeping amber arcs trace a confident hand — golden tension between organic curves and rigid geometry, a mind at the edge of a brilliant idea."
      );
    }
    setAiLoading(false);
  };

  return (
    <section
      id="hero"
      className="section"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div className="grid-bg" />

     {/* ambient glow */}
       {/* <div style={{ position: "absolute", top: "8%",  left: "4%",  width: 560, height: 560, background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 68%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "4%", right: "4%", width: 400, height: 400, background: "radial-gradient(circle, rgba(200,134,10,0.06) 0%, transparent 68%)", borderRadius: "50%", pointerEvents: "none" }} /> */}
            
            <div
  style={{
    position: "absolute",
    top: "8%",
    left: "4%",
    width: 560,
    height: 560,
    background:"radial-gradient(circle, rgba(255,215,0,0.18) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  }}
/>

<div
  style={{
    position: "absolute",
    bottom: "4%",
    right: "4%",
    width: 400,
    height: 400,
    background:
      "radial-gradient(circle, rgba(200,134,10,0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  }}
/>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
          paddingTop: 80,
        }}
      >
        {/* ── LEFT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <Badge variant="gold" dot>Now in Beta · Free to Join</Badge>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(42px, 6.5vw, 82px)",
              fontWeight: 900,
              lineHeight: 1.0,
              color: "var(--text-primary)",
              letterSpacing: "-2.5px",
            }}
          >
             𝚂𝚔𝚎𝚝𝚌𝚑.
            <br />
            <span className="gradient-text">𝙻𝚒𝚗𝚔.</span>
            <br />
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(22px, 3.2vw, 44px)",
                fontWeight: 400,
                color: "var(--text-muted)",
                letterSpacing: "-1px",
              }}
            >
              {typed}
              <span
                style={{ color: "var(--gold-600)" }}
                className="animate-blink"
              >
                |
              </span>
            </span>
          </h1>

          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(15px, 1.6vw, 18px)",
              color: "var(--text-secondary)",
              maxWidth: 460,
              lineHeight: 1.78,
              fontStyle: "italic",
            }}
          >
            A real-time collaborative drawing platform with AI-powered visual intelligence. Sketch, collaborate, and let the AI describe what your team creates.
          </p>

          {/* ── CTAs ── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Button variant="primary" size="lg" icon={<span>→</span>}>
              Launch Canvas
            </Button>
            <Button variant="gold-outline" size="lg" onClick={handleDescribe}>
              ✦ AI Describe
            </Button>
          </div>

          {/* ── AI result card ── */}
          {aiShown && (
            <Card
              variant="gold"
              padding="sm"
              style={{ maxWidth: 460, animation: "fade-slide 0.4s ease" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--gold-500)",
                    flexShrink: 0,
                  }}
                  className="animate-pulse-dot"
                />
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    color: "var(--gold-600)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  AI Vision · Live Analysis
                </span>
              </div>

              {aiLoading ? (
                <div style={{ display: "flex", gap: 5 }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6, height: 6,
                        borderRadius: "50%",
                        background: "var(--gold-500)",
                        display: "inline-block",
                        animation: `dot-bounce 1s ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 14,
                    fontStyle: "italic",
                    color: "rgba(15,15,15,0.62)",
                    lineHeight: 1.72,
                  }}
                >
                  {aiText}
                </p>
              )}
            </Card>
          )}

          {/* ── Social proof ── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {["12K+ Users", "99.9% Uptime", "Real-time Sync"].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--gold-600)", fontSize: 13, fontWeight: 700 }}>✓</span>
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: canvas mockup ── */}
        <div>
          <Card
            variant="elevated"
            padding="sm"
            style={{ padding: 0, overflow: "hidden", height: 460, borderRadius: 18 }}
          >
            {/* Window bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "11px 16px",
                background: "rgba(248,246,241,0.95)",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {["#FF5F57", "#FFBD2E", "#28C840"].map((c, i) => (
                <span key={i} style={{ width: 11, height: 11, background: c, borderRadius: "50%", display: "inline-block" }} />
              ))}
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  color: "rgba(0,0,0,0.25)",
                  marginLeft: 6,
                }}
              >
                canvas_01.𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔 — Live
              </span>
              <Badge
                variant="live"
                dot
                style={{ marginLeft: "auto", fontSize: 9, padding: "2px 9px" }}
              >
                LIVE
              </Badge>
            </div>

            {/* Canvas area */}
            <div style={{ height: "calc(100% - 38px)", background: "#F8F6F1", position: "relative" }}>
              <LiveSketchCanvas />

              {/* Collaborator avatars */}
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 14,
                  display: "flex",
                  zIndex: 2,
                }}
              >
                {AVATARS.map((av, i) => (
                  <div
                    key={i}
                    style={{
                      width: 28, height: 28,
                      borderRadius: "50%",
                      background: av.bg,
                      border: "2px solid #F8F6F1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#fff",
                      marginLeft: i > 0 ? -7 : 0,
                    }}
                  >
                    {av.label}
                  </div>
                ))}
                <div
                  style={{
                    width: 28, height: 28,
                    borderRadius: "50%",
                    background: "rgba(200,134,10,0.12)",
                    border: "2px solid rgba(200,134,10,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    color: "#C8860A",
                    marginLeft: -7,
                  }}
                >
                  +8
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
        className="animate-float"
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            color: "var(--text-muted)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: 38,
            background: "linear-gradient(to bottom, rgba(200,134,10,0.38), transparent)",
          }}
        />
      </div>
    </section>
  );
}
