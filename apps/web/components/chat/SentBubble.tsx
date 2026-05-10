"use client";

export function SentBubble({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <p className="text-[8px] text-white/30 font-mono">You</p>
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-black text-[12px] font-semibold leading-snug px-2.5 py-1.5 rounded-[10px_10px_2px_10px] max-w-[180px] break-words">
        {text}
      </div>
    </div>
  );
}