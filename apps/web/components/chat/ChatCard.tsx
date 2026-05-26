"use client";

import { uid } from "uid";
import { useState, useRef, useEffect } from "react";
import { ChatCardProps, Message } from "@/types/ChatType";
import { MsgBubble } from "./MsgBubble";
import { FetchMessages } from "@/service/RoomService";
import { Error } from "../ui/error";

import {
  getCurrentUser,
  getCurrentRoomSlug,
} from "@/service/getCurrentDetails";

export function ChatCard({
  roomId,
  isOpen,
  onClose,
  Socket,
}: ChatCardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resolvedName, setResolvedName] = useState("Sketch_Link");
  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // CURRENT USER REF
  const currentUserIdRef = useRef<string | null>(null);

  // OPTIMISTIC IDS
  const optimisticIdsRef = useRef<Map<string, boolean>>(
    new Map()
  );

  // CLOSE CHAT
  if (!isOpen) return null;

  // INVALID ROOM
  if (!roomId) {
    return <Error error="Room not found or invalid Room ID" />;
  }

  // ================= USER =================
  useEffect(() => {
    async function loadUser() {
      try {
        const id = await getCurrentUser();

        setCurrentUserId(id);

        currentUserIdRef.current = id;
      } catch (err) {
        console.error("User fetch error:", err);
      }
    }

    loadUser();
  }, []);

  // ================= ROOM NAME =================
  useEffect(() => {
    async function loadRoomName() {
      try {
        const slug = await getCurrentRoomSlug(roomId!);

        setResolvedName(slug);
      } catch {
        setResolvedName("Unknown Room");
      }
    }

    loadRoomName();
  }, [roomId]);

  // LOAD OLD MESSAGE 
  useEffect(() => {
    if (!currentUserId) return;

    async function loadMessages() {
      try {
        const data = await FetchMessages(roomId!);

        setMessages(
          data.reverse().map((msg: any) => ({
            id: String(msg.id) || uid(),
            sender: msg.userId,
            senderName: msg.user?.username ?? null,
            text: msg.message,
            isSelf: msg.userId === currentUserId,
            createdAt: new Date(msg.createdAt),
          }))
        );
      } catch {
        setError("Failed to load chat.");
      }
    }

    loadMessages();
  }, [roomId, currentUserId]);

  // WEBSOCKET 
  useEffect(() => {
    if (!roomId || !Socket || !currentUserId) return;

    const ws = Socket;

    // JOIN ROOM
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId,
        })
      );
    }

    // MESSAGE HANDLER
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      // ONLY CHAT
      if (data.type !== "chat") return;

      // ONLY CURRENT ROOM
      if (data.roomId !== roomId) return;

      const selfId = currentUserIdRef.current;

      const isSelf = data.userId === selfId;

      //  OPTIMISTIC UPDATE 
      if (isSelf && data.clientId) {
        if (
          optimisticIdsRef.current.has(data.clientId)
        ) {
          optimisticIdsRef.current.delete(
            data.clientId
          );

          // UPDATE EXISTING MESSAGE
          setMessages((prev) =>
            prev.map((m) =>
              m.id === data.clientId
                ? {
                    ...m,
                    id: data.id ?? m.id,
                    createdAt: data.createdAt
                      ? new Date(data.createdAt)
                      : m.createdAt,
                  }
                : m
            )
          );

          return;
        }
      }

      // NEW MESSAGE 
      setMessages((prev) => [
        ...prev,
        {
          id: data.id ?? uid(),
          sender: data.userId,
          senderName: data.username ?? null,
          text: data.message,
          isSelf,
          createdAt: data.createdAt
            ? new Date(data.createdAt)
            : new Date(),
        },
      ]);
    };

    // ERROR HANDLER
    const handleError = () => {
      console.log(" WebSocket error");
    };

    // CLOSE HANDLER
    const handleClose = (e: CloseEvent) => {
      console.log(
        "WS Closed:",
        e.code,
        e.reason
      );
    };

    // ADD LISTENERS
    ws.addEventListener("message", handleMessage);

    ws.addEventListener("error", handleError);

    ws.addEventListener("close", handleClose);

    // CLEANUP
    return () => {
      ws.removeEventListener(
        "message",
        handleMessage
      );

      ws.removeEventListener(
        "error",
        handleError
      );

      ws.removeEventListener(
        "close",
        handleClose
      );
    };
  }, [roomId, Socket, currentUserId]);

  //  AUTO SCROLL 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  //SEND MESSAGE 
  const send = () => {
    if (!input.trim() || !Socket) return;

    const text = input.trim();

    const clientId = uid();

    // TRACK OPTIMISTIC MESSAGE
    optimisticIdsRef.current.set(clientId, true);

    // INSTANT UI UPDATE
    setMessages((prev) => [
      ...prev,
      {
        id: clientId,
        sender: currentUserIdRef.current ?? "me",
        senderName: "You",
        text,
        isSelf: true,
        createdAt: new Date(),
      },
    ]);

    // SEND TO SERVER
    Socket.send(
      JSON.stringify({
        type: "chat",
        roomId,
        message: text,
        clientId,
      })
    );

    setInput("");
  };

  // UI 
  return (
    <div className="w-[300px] h-[400px] flex mt-96 mb-2.5 flex-col bg-[#1C1C1C] border border-white/[0.09] rounded-2xl overflow-hidden shadow-2xl">

      {/* HEADER */}
      <div className="h-9 bg-[#161616] border-b border-white/[0.07] flex items-center gap-2 px-3">

        <div className="flex gap-[5px]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />

          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />

          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>

        <span className="flex-1 text-center text-md font-bold text-white/55 truncate font-mono subpixel-antialiased">
          {resolvedName}
        </span>

        <button
          onClick={onClose}
          className="text-white/40 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>

      {/* MESSAGES */}
      <div className="h-[318px] overflow-y-auto flex flex-col gap-1.5 px-2.5 pt-2.5 pb-1">

        {error && (
          <p className="text-[10px] text-red-400">
            {error}
          </p>
        )}

        {messages.map((m) => (
          <MsgBubble key={m.id} msg={m} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="flex items-center gap-1.5 p-2 bg-[#161616] border-t border-white/[0.07]">

        <input
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) =>
            e.key === "Enter" && send()
          }
          placeholder="Message room…"
          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder:text-white/30 outline-none"
        />

        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-black text-[11px] flex items-center justify-center disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </div>
  );
}