"use client";

import { useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Plus,
} from "lucide-react";

import type { SketchEngine } from "@/drawingservice/engine/SketchEngine";
import type { Layer } from "@/drawingservice/LayerService";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/30 mb-1.5 font-mono">
      {children}
    </p>
  );
}

export default function LayersPanel({
  engine,
}: {
  engine: SketchEngine | null;
}) {
  const [, tick] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!engine) {
    return <p className="text-white/30 text-xs px-2">No engine connected.</p>;
  }

  const refresh = () => tick((n) => n + 1);

  const layers: Layer[] = [...engine.layers.getAll()].reverse();
  const activeLayerId = engine.getActiveLayerId();

  return (
    <div className="flex flex-col gap-1.5 px-1 py-1">
      <div className="flex items-center justify-between">
        <SectionLabel>Layers</SectionLabel>

        <button
          onClick={() => {
            const layer = engine.layers.add(
              `Layer ${engine.layers.getAll().length + 1}`
            );
            engine.setActiveLayer(layer.id);
            refresh();
          }}
          className="p-1 rounded bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15] text-white/50 hover:text-white transition active:scale-[0.95] cursor-pointer flex items-center justify-center"
        >
          <Plus size={11} />
        </button>
      </div>

      <div className="flex flex-col gap-1 mt-1">
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => {
              engine.setActiveLayer(layer.id);
              refresh();
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all duration-150 cursor-pointer text-[10px] font-mono select-none
            ${
              activeLayerId === layer.id
                ? "bg-white/[0.08] border-white/[0.15] text-white"
                : "bg-transparent border-transparent hover:bg-white/[0.04] text-white/60 hover:text-white"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                engine.layers.toggleVisible(layer.id);
                refresh();
              }}
              className="text-white/40 hover:text-white hover:bg-white/10 p-0.5 rounded transition cursor-pointer flex items-center justify-center"
            >
              {layer.visible ? <Eye size={11} /> : <EyeOff size={11} />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                engine.layers.toggleLocked(layer.id);
                refresh();
              }}
              className="text-white/40 hover:text-white hover:bg-white/10 p-0.5 rounded transition cursor-pointer flex items-center justify-center"
            >
              {layer.locked ? <Lock size={11} /> : <Unlock size={11} />}
            </button>

            <span className="flex-1 truncate tracking-wide text-left">{layer.name}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                engine.layers.moveUp(layer.id);
                refresh();
              }}
              className="text-white/20 hover:text-white hover:bg-white/10 p-0.5 rounded transition cursor-pointer flex items-center justify-center"
            >
              <ChevronUp size={11} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                engine.layers.moveDown(layer.id);
                refresh();
              }}
              className="text-white/20 hover:text-white hover:bg-white/10 p-0.5 rounded transition cursor-pointer flex items-center justify-center"
            >
              <ChevronDown size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}