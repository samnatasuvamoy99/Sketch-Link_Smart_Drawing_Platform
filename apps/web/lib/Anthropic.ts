
export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export async function askClaude(
messages: ClaudeMessage[], SYSTEM_PROMPT?: string): Promise<string> {

  const res = await fetch("/api/claude", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    throw new Error("AI request failed");
  }

  const data = await res.json();

  const text =
    data?.content
      ?.map((c: any) => (c.type === "text" ? c.text : ""))
      .join("") || "";

  return text || "No response from Claude";
}