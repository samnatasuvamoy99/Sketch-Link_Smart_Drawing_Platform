"use client";

import { Pencil, List } from "lucide-react";
import { SketchNavbar } from "@/components/layout/Navbar";
import { SketchSidebar } from "@/components/layout/Sidebar";
import { useState, useEffect, useRef } from "react";
import { getCurrentUserName } from "@/service/getCurrentDetails";
import DrawingCanvas from '@/components/canvas/CanvasSocket';
import { StrokeStyle } from "@/types/DrawingShapesTypes";
import { SketchEngine } from "@/drawingservice/engine/SketchEngine";

//Navbar → Layout(state) → DrawingCanvas → initSketch
export default function Layout() {

  const [showPage, setShowPage] = useState(true);
  const [username, setUsername] = useState<string>("Sketch_Link");
  const [mode, setMode] = useState<"home" | "draw">("home");
  const [selectedTool, setSelectedTool] = useState<string>("pencil");
  const [color, setColor] = useState<string>("#fff");
  const [strokeWidth, setStrokeWidth] = useState<number>(1.5);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");

  const engineRef = useRef<SketchEngine | null>(null);
  const [engine, setEngine] = useState<SketchEngine | null>(null); //  Engine state for sidebar panels

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getCurrentUserName();
        setUsername(data.username);
      } catch (err) {
        //console.error(err);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">

      {/* BACKGROUND */}
      <div
        className="absolute z-0 pointer-events-none"
        style={{
          top: "9%",
          left: "25%",
          width: 560,
          height: 560,
          background:
            "radial-gradient(circle, rgba(255,215,0,0.18) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* NAVBAR */}
      <SketchNavbar
        username={username}
        onToolSelect={(tool) => {
          setMode("draw");
          setSelectedTool(tool);
        }}
        onStrokeChange={(style) => setStrokeStyle(style)}
        onInsertImage={() => engineRef.current?.insertImage()} //  
      />

      {/* LIST BUTTON (FIXED POSITION) */}
      <div className="fixed top-16 left-4 z-50">
        <button
          onClick={() => setShowPage(true)}
          className="text-white hover:text-yellow-400 transition"
        >
          <List size={23} />
        </button>
      </div>

      {/* SIDEBAR */}
      {showPage && (
        <SketchSidebar
          isOpen={showPage}
          onClose={() => setShowPage(false)}
          onColorChange={(c) => setColor(c)}
          onStrokeWidthChange={(width) => setStrokeWidth(width)}
          onReset={() => engineRef.current?.resetCanvas()}
          engine={engine} //
        />
      )}

      {/* DASHBOARD CONTENT */}
      <div
        className={`relative z-10 flex flex-col items-center mt-20 pt-14 transition-all duration-500 ${
          mode === "draw"
            ? "opacity-0 scale-95 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <Pencil size={48} className="opacity-50 text-yellow-400" />

        <div className="text-white font-semibold font-mono text-2xl mt-4">
          Welcome Back, {username || "User"}!
        </div>

        <div className="text-white mt-3 font-normal font-serif italic text-center">
          Pick a shape, choose a color, and start drawing — or
          <br />
          invite your team to sketch together in real time.
        </div>

        <div className="pt-3 italic text-2xl opacity-20 text-yellow-200">
          𝓒𝓵𝓲𝓬𝓴 𝓪 𝓼𝓱𝓪𝓹𝓮 𝓪𝓫𝓸𝓿𝓮 · 𝓭𝓻𝓪𝓰 𝓽𝓸 𝓭𝓻𝓪𝔀 · 𝓬𝓸𝓵𝓵𝓪𝓫𝓸𝓻𝓪𝓽𝓮
        </div>
      </div>

      {/* CANVAS */}
      {mode === "draw" && (
        <div className="fixed inset-0 z-10 bg-black">
          <DrawingCanvas
            tool={selectedTool}
            color={color}
            strokeWidth={strokeWidth}
            strokeStyle={strokeStyle}
            onEngineReady={(eng) => {
              engineRef.current = eng;
              setEngine(eng); // 
            }}
          />
        </div>
      )}
    </div>
  );
}
