
"use client";

import { useEffect, useRef, useState } from "react";

import { SketchEngine } from "@/drawingservice/engine/SketchEngine";

import { CanvasDrawingProps } from "../../types/DrawingShapesTypes";

import { getExistingShapes } from "@/service/ShapeService";

import { SpinnerDemo } from "../loading/loading";

export function CanvasDrawing({
  canvasRef,
  textAreaRef,
  tool,
  color,
  strokeWidth,
  strokeStyle,
  Socket,
  roomId,
  onEngineReady,
}: CanvasDrawingProps) {

  // ENGINE REF
  const engineRef = useRef<SketchEngine | null>(null);

  // STABLE SOCKET REF
  const socketRef = useRef<WebSocket | null>(Socket ?? null);

  // LOADING STATE
  const [loading, setLoading] = useState(true);

  // INITIAL SHAPES
  const [initialShapes, setInitialShapes] = useState<any[]>([]);

  // KEEP SOCKET UPDATED
  useEffect(() => {
    socketRef.current = Socket ?? null;
  }, [Socket]);

  // FETCH EXISTING SHAPES
  useEffect(() => {

    const fetchShapes = async () => {

      try {

        if (!roomId) {
          setLoading(false);
          return;
        }

        const shapes = await getExistingShapes(roomId);

        setInitialShapes(shapes);

      } catch (err) {

       // console.error(err);

      } finally {

        setLoading(false);
      }
    };

    fetchShapes();

  }, [roomId]);

  // INIT ENGINE
  useEffect(() => {

    if (!canvasRef.current || loading) return;

    // PREVENT DUPLICATE ENGINE
    if (engineRef.current) return;

    const engine = new SketchEngine(canvasRef.current, {
      socket: socketRef.current,
      roomId,
      textarea: textAreaRef?.current,
      initialShapes,
    });

    engineRef.current = engine;

    // SEND ENGINE TO PARENT
    onEngineReady?.(engine);

    return () => {

      engine.destroy();

      engineRef.current = null;
    };

  }, [loading, Socket]);

  // UPDATE SOCKET INSIDE ENGINE
  useEffect(() => {

    if (!engineRef.current) return;

    engineRef.current.setSocket(Socket ?? null);

  }, [Socket]);

  // TOOL
  useEffect(() => {

    if (!engineRef.current) return;

    engineRef.current.setTool(tool ?? "pencil");

  }, [tool]);

  // COLOR
  useEffect(() => {

    if (!engineRef.current) return;

    engineRef.current.setColor(color ?? "#fff");

    if (textAreaRef?.current) {

      textAreaRef.current.style.color = color ?? "#fff";

      textAreaRef.current.style.border =
        `2px solid ${color}`;

      textAreaRef.current.style.caretColor =
        color ?? "#fff";
    }

  }, [color]);

  // STROKE WIDTH
  useEffect(() => {

    if (!engineRef.current) return;

    engineRef.current.setStroke(strokeWidth ?? 1.5);

  }, [strokeWidth]);

  // STROKE STYLE
  useEffect(() => {

    if (!engineRef.current) return;

    engineRef.current.setStrokeStyle(
      strokeStyle ?? "solid"
    );

  }, [strokeStyle]);

  return (
    <div className="relative w-full h-full">

      {loading ? (

        <div className="flex items-center justify-center h-full bg-black">
          <SpinnerDemo />
        </div>

      ) : (

        <>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />

          {/* <textarea
            ref={textAreaRef}
            className="absolute hidden resize-none overflow-hidden z-[9999]"
            style={{
              fontSize: "16px",
              fontFamily: "sans-serif",
              lineHeight: "1.2",
              padding: "4px 8px",
              minWidth: "150px",
              minHeight: "30px",
              backgroundColor: "rgba(0,0,0,0.8)",
              outline: "none",
              borderRadius: "4px",
            }}
          /> */}

          <textarea
  ref={textAreaRef}
  className="absolute hidden resize-none overflow-hidden z-[9999]"
  style={{
    fontSize: "16px",
    fontFamily: "sans-serif",
    lineHeight: "1.2",
    padding: "4px 8px",
    minWidth: "150px",
    minHeight: "30px",

    backgroundColor: "rgba(0,0,0,0.8)",

    // ADD THESE
    color: "#ffffff",
    caretColor: "#ffffff",
    border: "1px solid rgba(255,255,255,0.15)",

    outline: "none",
    borderRadius: "4px",
  }}
/>
        </>

      )}
    </div>
  );
}


