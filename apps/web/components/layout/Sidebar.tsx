"use client";

import { useState, ReactNode, useEffect } from "react";
import { Layers, Sparkles, Download, History, Hexagon, X, RotateCcw } from "lucide-react";
import { SidebarProps } from "@/types/Sidebarprops";
import type { StrokeWidth } from "@/types/Sidebarprops";
import { PanelButton } from "./SidebarPanelButton";
import { RoomCard } from "../room/RoomCard";
import DownloadPanel from "../panels/DownloadPanel";
import HistoryPanel from "../panels/History";
import LayersPanel from "../panels/LayersPanel";
import { SketchEngine } from "@/drawingservice/engine/SketchEngine";


/* ─── Types */
type PanelTool = {
  id: string;
  label: string;
  icon: ReactNode;
};

type ColorType = {
  hex: string;
  label: string;
};

/* ─── Constant */

const PANEL_TOOLS: PanelTool[] = [
  { id: "layers", label: "Layers", icon: <Layers size={14} /> },
  { id: "ai", label: "AI Assist", icon: <Sparkles size={14} /> },
  { id: "history", label: "History", icon: <History size={14} /> },
  { id: "download", label: "Download", icon: <Download size={14} /> },
  { id: "room", label: "Room", icon: <Hexagon size={14} /> },
];


const COLORS: ColorType[] = [
  { hex: "#F0EDE6", label: "Chalk" },
  { hex: "#F6C347", label: "Amber" },
  { hex: "#5B9BD5", label: "Blue" },
  { hex: "#4CAF7D", label: "Green" },
  { hex: "#F0874A", label: "Orange" },
  { hex: "#8B9BB4", label: "Slate" },
  { hex: "#DC2626", label: "Red" },
  // { hex: "#C084FC", label: "Violet"  },  
  { hex: "#2DD4BF", label: "Teal" },
];


function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/30 mb-1.5 font-mono">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-white/[0.07] my-0.3" />;
}



interface SketchSidebarProps {
  isOpen:               boolean;
  onClose:              () => void;
  activeTool?:          string;
  activeColor?:         string;
  activeStrokeWidth?:   StrokeWidth;
  onStrokeWidthChange?: (w: StrokeWidth)  => void;
  onToolChange?:        (t: string)       => void;
  onColorChange?:       (c: string)       => void;
  onReset?:             ()                => void;
  /** Pass engineRef.current from Layout */
  engine?:              SketchEngine | null;
}




/* ─── Sidebar*/

export function SketchSidebar({
  isOpen,
  onClose,
  activeTool = "pen",
  activeColor = "#FFFFFF",
  activeStrokeWidth = 1.5,
  onStrokeWidthChange,
  onToolChange,
  onColorChange,
  onReset,
  engine,
}: SketchSidebarProps) {
  const [tool, setTool] = useState<string>(activeTool);
  const [color, setColor] = useState<string>(activeColor);
  const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(activeStrokeWidth);


  // Which sub-panel is open (history / layers / download / room)
  const [openPanel,   setOpenPanel]   = useState<string | null>(null);
 


  /*Send stroke width to parent */
  useEffect(() => {
    onStrokeWidthChange?.(strokeWidth);
  }, [strokeWidth]);


  if (!isOpen) return null;

  const handleTool = (id: string) => {
    setOpenPanel((prev) => (prev === id ? null : id));
  }

  const handleColor = (hex: string) => {
    setColor(hex);
    onColorChange?.(hex);
  };


  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40"
      />

      {/* Sidebar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed  mt-16  ml-12 rounded top-0 left-0 h-auto w-56 bg-[#1C1C1C] z-50 border-r border-white/[0.09] p-3 flex flex-col gap-3 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-white text-sm">Tools</span>
          <button onClick={onClose}>
            <X size={16} className="text-white/70 hover:text-white" />
          </button>
        </div>

        <Divider />

        {/* Colors */}
        <div>
          <SectionLabel>Colors</SectionLabel>
          <div className="flex flex-wrap gap-1">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => handleColor(c.hex)}
                className={`w-5 h-5 rounded-full border ${color === c.hex ? "border-white border-1 w-6 h-6" : "border-transparent"
                  }`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        <Divider />

        {/* Stroke Width */}
        <div>
          <SectionLabel>Stroke</SectionLabel>
          <div className="flex gap-1">
            {[1.5, 2, 2.5, 3.5].map((w) => (
              <button
                key={w}
                onClick={() => setStrokeWidth(w as StrokeWidth)}
                className={`w-6 h-6 flex items-center justify-center rounded-md border border-white/10 transition
                ${strokeWidth === w
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                  }`}
              >
                <div
                  className="w-5 bg-white rounded"
                  style={{ height: `${w}px` }}
                />
              </button>
            ))}
          </div>
        </div>

        <Divider />


        {/* Panels */}
        <div className="flex flex-col gap-1">
          <SectionLabel>Panels</SectionLabel>
          <div className="flex flex-col gap-1">
            {PANEL_TOOLS.map((t) => (
              <PanelButton key={t.id} tool={t} onClick={() => handleTool(t.id)} 
              
                 // highlight the active panel button
                  active={openPanel === t.id}
              />
            ))}
          </div>

          {openPanel === "room" && (
            <div className="fixed inset-0 flex items-center justify-center z-[10000]">
              <RoomCard
                isOpen={true}
                onClose={() => setOpenPanel(null)}   // close card
                onRoomCreated={(room) => {
                  console.log("Created:", room);
                }}
                onRoomJoined={(data) => {
                  console.log("Joined:", data);
                }}
              />
            </div>
          )}
        </div>

        <Divider />

        <button
          onClick={onReset}
          className="text-red-700 text-sm justify-center hover:text-white text-left w-full px-1.5 py-1.5 rounded-lg border border-white/[0.07] bg-transparent hover:bg-white/[0.06] flex items-center transition"
        >
          Reset
          <RotateCcw className="hover:text-red-600 ml-1 mt-1" size={14} />
        </button>
      </div>

      {/* Slide-out Secondary Flyout Panel */}
      {openPanel && openPanel !== "room" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed mt-14 left-[280px] rounded top-0 w-64 bg-[#1C1C1C] z-50 border border-white/[0.09] p-3 flex flex-col gap-3 max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-left-2 duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-white text-[10px] font-bold uppercase tracking-wider font-mono">
              {openPanel === "layers" && "Layer Manager"}
              {openPanel === "history" && "Action History"}
              {openPanel === "download" && "Export Canvas"}
              {openPanel === "ai" && "AI Assistant"}
            </span>
            <button onClick={() => setOpenPanel(null)}>
              <X size={14} className="text-white/50 hover:text-white transition" />
            </button>
          </div>

          <Divider />

          <div className="flex flex-col gap-1">
            {openPanel === "layers" && <LayersPanel engine={engine ?? null} />}
            {openPanel === "history" && <HistoryPanel engine={engine ?? null} />}
            {openPanel === "download" && <DownloadPanel engine={engine ?? null} />}
            {openPanel === "ai" && (
              <div className="text-white/40 text-xs px-2 font-mono py-1">
                AI Assist is ready.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
