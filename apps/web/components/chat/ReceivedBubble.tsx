"use client";

const AVATAR_COLORS: Record<string, string> = {
  "0": "#534AB7", "1": "#0F6E56", "2": "#993C1D", "3": "#185FA5",
  "4": "#854F0B", "5": "#993556", "6": "#3B6D11", "7": "#5F5E5A",
  "8": "#A32D2D", "9": "#0C447C", a: "#26215C", b: "#04342C",
  c: "#4A1B0C", d: "#3B6D11", e: "#633806", f: "#791F1F",
};

export function ReceivedBubble({
  sender,
  senderName,
  text,
}: {
  sender: string;
  senderName: string | null;
  text: string;
}) {
  const lastSegment = sender?.split("-").pop() || "";
  const key = lastSegment?.[0]?.toLowerCase() || "?";
  const displayChar = lastSegment?.[0]?.toUpperCase() || "?";
  const bgColor = AVATAR_COLORS[key] ?? "#5F5E5A";

  // Show username if available, otherwise shorten the UUID
  const displayName = senderName
    ? senderName
    : sender
    ? `${sender.slice(0, 8)}…`
    : "Unknown";

  return (
    <div className="flex gap-1.5 items-end">
      {/* Avatar */}
      <div
        style={{ backgroundColor: bgColor }}
        className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 text-white"
      >
        {displayChar}
      </div>

      {/* Message */}
      <div>
        <p className="text-[8px] text-white/30 mb-0.5 font-mono truncate max-w-[160px]">
          {displayName}
        </p>
        <div className="bg-white/5 border border-white/[0.07] text-white/70 text-[12px] italic leading-snug px-2.5 py-1.5 rounded-[10px_10px_10px_2px] max-w-[180px] break-words">
          {text}
        </div>
      </div>
    </div>
  );
}