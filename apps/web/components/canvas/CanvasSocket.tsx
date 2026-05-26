"use client";

import { useRef } from "react";
import { CanvasProps } from "@/types/DrawingShapesTypes";
import { SpinnerDemo } from "../loading/loading";
import { Error } from "../ui/error";
import { CanvasDrawing } from "./CanvasArea";



export default function CanvasSocket({
  roomId,
  token,
  tool,
  color,
  strokeWidth,
  strokeStyle,
  onEngineReady,
  Socket,
}: CanvasProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // LOADING
  if (token && roomId && !Socket) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <SpinnerDemo />
      </div>
    );
  }

  // ERROR
  if (token && roomId && Socket?.readyState === WebSocket.CLOSED) {
    return <Error error="WebSocket connection failed" />;
  }

  const commonProps = {
    canvasRef,
    textAreaRef: textareaRef,
    tool,
    color,
    strokeWidth,
    strokeStyle,
    onEngineReady,
  };

  return (
    <CanvasDrawing
      {...commonProps}
      Socket={Socket}
      roomId={roomId}
    />
  );
}