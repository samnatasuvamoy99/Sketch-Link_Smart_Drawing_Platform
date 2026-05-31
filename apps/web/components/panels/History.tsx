"use client";

import { useState } from "react";
import { Undo2, Redo2 } from "lucide-react";
import type { SketchEngine } from "@/drawingservice/engine/SketchEngine";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/30 mb-1.5 font-mono">
      {children}
    </p>
  );
}

export default function HistoryPanel({
  engine,
}: {
  engine: SketchEngine | null;
}) {
  const [, tick] = useState(0);

  if (!engine) {
    return <p className="text-white/30 text-xs px-2">No engine connected.</p>;
  }

  const refresh = () => tick((n) => n + 1);

  return (
    <div className="flex flex-col gap-1.5 px-1 py-1">
      <SectionLabel>History</SectionLabel>

      <div className="flex gap-1.5">
        <button
          onClick={() => {
            engine.undo();
            refresh();
          }}
          disabled={!engine.history.canUndo()}
          className="group flex-1 flex items-center justify-center gap-1 py-1 rounded-md border bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15] text-white/70 hover:text-white active:scale-[0.98] transition-all duration-150 text-[10px] font-mono cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed"
        >
          <Undo2 size={11} className="text-white/40 group-hover:text-white/70 transition-colors" />
          Undo
        </button>

        <button
          onClick={() => {
            engine.redo();
            refresh();
          }}
          disabled={!engine.history.canRedo()}
          className="group flex-1 flex items-center justify-center gap-1 py-1 rounded-md border bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15] text-white/70 hover:text-white active:scale-[0.98] transition-all duration-150 text-[10px] font-mono cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed"
        >
          <Redo2 size={11} className="text-white/40 group-hover:text-white/70 transition-colors" />
          Redo
        </button>
      </div>
    </div>
  );
}