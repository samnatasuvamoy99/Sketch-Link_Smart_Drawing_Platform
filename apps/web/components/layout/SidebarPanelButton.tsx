import { ChevronRight } from "lucide-react"
import { ReactNode } from "react";

 type PanelTool = {
   id: string;
   label: string;
   icon: ReactNode;
 };
 
 
 export function PanelButton({
  tool,
  onClick,
  active = false,
}: {
  tool: PanelTool;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group w-full px-2 py-1 rounded-md border flex items-center gap-2 transition-all duration-200 ${
        active
          ? "bg-white/[0.08] border-white/[0.15] text-white"
          : "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/[0.05] text-white/60 hover:text-white"
      }`}
    >
      <span className={`transition-colors duration-200 ${active ? "text-yellow-400" : "text-white/30 group-hover:text-white/60"}`}>
        {tool.icon}
      </span>
      <span className="text-[10px] font-mono flex-1 text-left tracking-wide">
        {tool.label}
      </span>
      <ChevronRight
        size={10}
        className={`text-white/20 transition-all duration-200 ${
          active ? "translate-x-0.5 text-white/70" : "group-hover:translate-x-0.5 group-hover:text-white/40"
        }`}
      />
    </button>
  );
}
