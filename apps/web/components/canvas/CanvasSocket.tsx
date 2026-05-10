

"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasProps } from "@/types/DrawingShapesTypes";
import { WEBSOCKET_URL } from "../../config";
import { SpinnerDemo } from "../loading/loading";
import { CanvasDrawing } from "./CanvasArea";
import { apiJoinRoomWS } from "@/service/RoomService";
import { Error } from "../ui/error";

export default function CanvasSocket({
  roomId,
  token,
  tool,
  color,
  strokeWidth,
  strokeStyle,
  onEngineReady
}: CanvasProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // WebSocket stored in ref (NOT state)
  const socketRef = useRef<WebSocket | null>(null);

  // UI state only
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectingRef = useRef(false);

  // WebSocket lifecycle

  useEffect(() => {
    if (!token || !roomId) return;

    if (connectingRef.current || socketRef.current) return;

  connectingRef.current = true;


    const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);

    ws.onopen = async () => {
      try {
        await apiJoinRoomWS(ws, roomId);

        socketRef.current = ws;
        setReady(true);
      } catch (err: any) {
        setError(err?.message || "Invalid Room ID");
        ws.close();
      }
    };
 
    
    ws.onerror = () => {
      setError("WebSocket connection failed");
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      socketRef.current = null;
      setReady(false);
      connectingRef.current = false;
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [roomId, token]);


  // ERROR UI

  if (error && !ready) {
    return <Error error={error} />;
  } 


  // LOADING STATE (collab mode)

  if (token && roomId && !ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <SpinnerDemo />
      </div>
    );
  }


  

  // Shared props

  const commonProps = {
    canvasRef,
    textAreaRef: textareaRef,
    tool,
    color,
    strokeWidth,
    strokeStyle,
    onEngineReady
  };


  // LOCAL MODE

  if (!token || !roomId) {
    return <CanvasDrawing {...commonProps} />;
  }


  // COLLAB MODE

  return (
    <CanvasDrawing
      {...commonProps}
      Socket={socketRef.current ?? undefined}
      roomId={roomId}
    />
  );
}