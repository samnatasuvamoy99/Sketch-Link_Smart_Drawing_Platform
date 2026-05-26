"use client";
import { useState, useEffect } from "react";
import { Button, Badge } from "@repo/ui";
import Link from 'next/link'

const NAV_ITEMS = [
  { id: "hero",          label: "Home" },
  { id: "features",      label: "Features" },
  { id: "aichat",        label: "AI Chat" },
  { id: "pricing",       label: "Pricing" },
];

export function Navbar({ activeSection }: { activeSection: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <nav
      style={{
        position:   "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        display:   "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding:   "0 40px",
        height:    64,
        transition: "all 0.4s ease",
        background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.07)" : "none",
        boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* ── Logo ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg,#FFD700,#C8860A)",
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display',serif",
            fontWeight: 900, fontSize: 18, color: "#fff",
            boxShadow: "0 2px 14px rgba(200,134,10,0.32)",
            flexShrink: 0,
          }}
        >
          S
        </div>
        <span
          style={{
            fontFamily: "'Space Mono',monospace",
            fontWeight: 900,
            fontSize: 25,
            color: "#0F0F0F",
            letterSpacing: "-0.3px",
          }}
        >
         𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔
        </span>
      </div>

      {/* ── Nav links ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
        className="hidden-mobile"
      >
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 11,
                fontWeight: active ? 700 : 400,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: active ? "#C8860A" : "rgba(15,15,15,0.45)",
                background: active ? "rgba(200,134,10,0.07)" : "transparent",
                border: "none",
                borderRadius: 7,
                padding: "7px 14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color   = "#0F0F0F";
                  e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color   = "rgba(15,15,15,0.45)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── CTA ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Badge variant="live" dot>Live Beta</Badge>
         
         <Link href={"/signup"}>
         <Button variant="primary" size="sm">
          Start Free →
        </Button>
         </Link>
        
      </div>
    </nav>
  );
}

export default Navbar;
