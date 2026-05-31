"use client";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Button, Card, Badge } from "@repo/ui";
import { askClaude, ClaudeMessage } from "@/lib/Anthropic";

const SYSTEM_PROMPT = `You are 𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔 AI — the intelligent assistant for SketchSync, a real-time collaborative drawing platform. Help users with: platform features, drawing tools, real-time collaboration, AI describer, messaging, design tips, sketching techniques, and team workflows. Be concise, warm, and slightly creative. Use short paragraphs. No markdown headers. Use ✦ sparingly.`;

const SUGGESTIONS = [
  "How does real-time sync work?",
  "Explain the AI Describe feature",
  "Tips for remote design sprints",
  "What templates are available?",
];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function AIChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi! I'm 𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔 AI ✦  Ask me anything about the platform, drawing techniques, collaboration tips, or how our AI features work.",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    try {
      const history: ClaudeMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.text,
      }));
      const reply = await askClaude(
        [...history, { role: "user", content: q }],
        SYSTEM_PROMPT
      );
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Connection hiccup — please try again!" },
      ]);
    }
    setLoading(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <section
      id="aichat"
      className="section"
      style={{
        padding: "96px 0",
        background: "var(--bg-primary)",
      }}
    >
      <div className="grid-bg" />
      <div style={{ position: "absolute", top: "10%", right: "4%", width: 480, height: 480, background: "radial-gradient(circle,rgba(255,215,0,0.07) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1.45fr",
          gap: 72,
          alignItems: "start",
        }}
      >
        {/* ── LEFT ── */}
        <div style={{ paddingTop: 12 }}>
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
              fontSize: "clamp(30px, 3.8vw, 52px)",
              fontWeight: 900,
              color: "var(--text-primary)",
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
              marginBottom: 18,
            }}
          >
            Ask anything.
            <br />
            <span className="gradient-text">Get smart answers.</span>
          </h2>
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 16,
              fontStyle: "italic",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
              marginBottom: 32,
            }}
          >
            𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔 AI knows the platform inside out. Ask about features, get design advice, explore collaboration workflows, or discover what's possible with AI-powered drawing.
          </p>

          {/* Suggestion pills */}
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            Try asking:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
            {SUGGESTIONS.map((s, i) => (
              <Button
                key={i}
                variant="gold-outline"
                size="sm"
                style={{ justifyContent: "flex-start", letterSpacing: "0.02em", fontSize: 12, fontWeight: 400, textTransform: "none" }}
                onClick={() => setInput(s)}
              >
                → {s}
              </Button>
            ))}
          </div>

          <Badge variant="live" dot style={{ fontSize: 10 }}>
            AI is live · Powered by Claude
          </Badge>
        </div>

        {/* ── RIGHT: Chat UI ── */}
        <Card
          variant="elevated"
          padding="sm"
          style={{
            padding: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: 560,
            borderRadius: 18,
          }}
        >
          {/* Chat header */}
          <div
            style={{
              background: "linear-gradient(135deg,#FFD700,#C8860A)",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 34, height: 34,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}
            >
              ✦
            </div>
            <div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: "#fff" }}>SketchSync AI</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Always online</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.45)", display: "inline-block" }} />
              ))}
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "var(--bg-primary)",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  gap: 9,
                  animation: "fade-slide 0.35s ease",
                }}
              >
                {m.role === "assistant" && (
                  <div
                    style={{
                      width: 28, height: 28,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#FFD700,#C8860A)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, flexShrink: 0, marginTop: 2,
                    }}
                  >
                    ✦
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "11px 15px",
                    borderRadius:
                      m.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    background:
                      m.role === "user"
                        ? "linear-gradient(135deg,#FFD700,#C8860A)"
                        : "var(--bg-secondary)",
                    color:
                      m.role === "user" ? "#fff" : "var(--text-primary)",
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 14,
                    fontStyle: m.role === "assistant" ? "italic" : "normal",
                    lineHeight: 1.68,
                    border:
                      m.role === "assistant"
                        ? "1px solid rgba(0,0,0,0.06)"
                        : "none",
                    boxShadow:
                      m.role === "user"
                        ? "0 2px 14px rgba(200,134,10,0.22)"
                        : "0 1px 4px rgba(0,0,0,0.04)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div
                  style={{
                    width: 28, height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#FFD700,#C8860A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, flexShrink: 0,
                  }}
                >
                  ✦
                </div>
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "14px 14px 14px 4px",
                    padding: "13px 16px",
                    display: "flex",
                    gap: 5,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6, height: 6,
                        borderRadius: "50%",
                        background: "var(--gold-600)",
                        display: "inline-block",
                        animation: `dot-bounce 0.9s ${i * 0.18}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div
            style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              padding: "13px 14px",
              display: "flex",
              gap: 10,
              background: "var(--bg-secondary)",
              flexShrink: 0,
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about SketchSync…"
              rows={1}
              style={{
                flex: 1,
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.09)",
                borderRadius: 10,
                padding: "10px 14px",
                fontFamily: "'DM Serif Display', serif",
                fontSize: 14,
                color: "var(--text-primary)",
                resize: "none",
                lineHeight: 1.5,
                transition: "border-color 0.2s",
              }}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={send}
              disabled={loading || !input.trim()}
              style={{ padding: "0 18px", fontSize: 18, fontWeight: 700, letterSpacing: 0, textTransform: "none", borderRadius: 10 }}
            >
              ↑
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
