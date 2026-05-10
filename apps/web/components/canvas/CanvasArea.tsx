

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
  onEngineReady
}: CanvasDrawingProps) {
  const engineRef = useRef<SketchEngine | null>(null);
  const socketRef = useRef<WebSocket | undefined>(Socket); // ← stabilize socket
  const [loading, setLoading] = useState(true);
  const [initialShapes, setInitialShapes] = useState<any[]>([]);

  // Keep socketRef current without triggering re-init
  useEffect(() => {
    socketRef.current = Socket;
  }, [Socket]);

  // 1. FETCH SHAPES
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShapes();
  }, [roomId]);

  // 2. INIT ENGINE — runs exactly once after shapes load
  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const engine = new SketchEngine(canvasRef.current, {
      socket: socketRef.current,  // use stable ref
      roomId,
      textarea: textAreaRef?.current,
      initialShapes,
    });

    engineRef.current = engine;

    onEngineReady?.(engine);  // for reset

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [loading]); // ← CRITICAL: only re-init when loading changes

  // 3. TOOL — just call setter, no re-init
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setTool(tool ?? "pencil");
  }, [tool]);

  // 4. COLOR
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setColor(color ?? "#fff");

    if (textAreaRef?.current) {
      textAreaRef.current.style.color = color ?? "#fff";
      textAreaRef.current.style.border = `2px solid ${color}`;
      textAreaRef.current.style.caretColor = color ?? "#fff";
    }
  }, [color]);

  // 5. STROKE WIDTH
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setStroke(strokeWidth ?? 1.5);
  }, [strokeWidth]);

  // 6. STROKE STYLE
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setStrokeStyle(strokeStyle ?? "solid");
  }, [strokeStyle]);

  return (
    <div className="relative w-full h-full">
      {loading ? (
        <div className="flex items-center justify-center h-full bg-black">
          <SpinnerDemo />
        </div>
      ) : (
        <>
          <canvas ref={canvasRef} className="w-full h-full" />
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
              outline: "none",
              borderRadius: "4px",
            }}
          />
        </>
      )}
    </div>
  );
}