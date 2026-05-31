"use client";

import {
  Download,
  FileJson,
  Image as ImageIcon,
} from "lucide-react";

import type { SketchEngine } from "@/drawingservice/engine/SketchEngine";
import type { DownloadFormat } from "@/drawingservice/DownloadService";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/30 mb-1.5 font-mono">
      {children}
    </p>
  );
}

export default function DownloadPanel({
  engine,
}: {
  engine: SketchEngine | null;
}) {
  if (!engine) {
    return <p className="text-white/30 text-xs px-2">No engine connected.</p>;
  }

  const formats: {
    format: DownloadFormat;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      format: "png",
      label: "PNG",
      icon: <ImageIcon size={13} />,
    },
    {
      format: "jpeg",
      label: "JPEG",
      icon: <ImageIcon size={13} />,
    },
    {
      format: "json",
      label: "JSON",
      icon: <FileJson size={13} />,
    },
  ];

  return (
    <div className="flex flex-col gap-1.5 px-1 py-1">
      <SectionLabel>Download</SectionLabel>

      {formats.map((item) => (
        <button
          key={item.format}
          onClick={() => engine.download(item.format)}
          className="group flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15] text-white/70 hover:text-white active:scale-[0.98] transition-all duration-150 text-[11px] font-mono text-left cursor-pointer"
        >
          <span className="text-white/40 group-hover:text-white/70 transition-colors">
            {item.icon}
          </span>
          <span className="flex-1 font-mono tracking-wide">{item.label}</span>
          <Download size={11} className="text-white/20 group-hover:text-white/50 transition-colors" />
        </button>
      ))}
    </div>
  );
}