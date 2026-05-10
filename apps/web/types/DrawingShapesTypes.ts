
import React from "react";
import { SketchEngine} from "@/drawingservice/engine/SketchEngine";




export type StrokeStyle = "solid" | "dashed" | "dotted" | "bold";

type BaseShape = {
  id: string;
  color: string;
  strokeWidth?: number;
  strokeStyle?: StrokeStyle;
};

export type Shape =
  | (BaseShape & {
      type: "rectangle";
      x: number;
      y: number;
      width: number;
      height: number;
    })
    |

     (BaseShape & {
      type: "text";
      x: number;
      y: number;
      text: string;
      color: string;
      fontSize: number;
    })
    |

    (BaseShape & {
    type: "diamond";
    x: number;
    y: number;
    width: number;
    height: number;
  })
  | (BaseShape & {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    })
    |
    (BaseShape & {
       type: "ellipse"; 
      centerX: number;
      centerY: number;
      radiusX: number;
      radiusY: number;
    })
  | (BaseShape & {
      type: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    })
  | (BaseShape & {
      type: "arrow";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    })
  | (BaseShape & {
      type: "pencil";
      points: { x: number; y: number }[];
    });


  export type CanvasRealtimeProps = {
  roomId?: string;
  token?:string
};


export type CanvasProps = {
  roomId?: string;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  textAreaRef?:React.RefObject<HTMLTextAreaElement| null>;
  Socket?: WebSocket | undefined;
  token?:string;
  tool: string;
  color: string;          
  strokeWidth?: number; 
  strokeStyle?:StrokeStyle
  onEngineReady?: (engine: SketchEngine) => void;
};


export type CanvasDrawingProps = {
  roomId?: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  textAreaRef?: React.RefObject<HTMLTextAreaElement | null>;
  tool?: string;
  color?: string;
  strokeWidth?: number;
  strokeStyle?: StrokeStyle;
  onEngineReady?: (engine: SketchEngine) => void;
  Socket?: WebSocket;
};