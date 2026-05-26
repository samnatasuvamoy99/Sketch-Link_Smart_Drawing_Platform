"use client"
import { useState } from 'react';
import { MousePointer2, Pencil, Square, Circle, Diamond, ArrowRight, Minus, Users, Eraser, Image, Type } from "lucide-react"
import { ChatCard } from '../chat/ChatCard';
import { TextFormat } from '@/app/icon/Text';
import { StrokeStyle } from '@/types/DrawingShapesTypes';
import Tooltip from "@mui/material/Tooltip";



type Props = {
  username?: string,
  onToolSelect?: (tool: string) => void;
  onStrokeChange?: (stroke: StrokeStyle) => void;
  roomId?: string
  token?: string
  Socket?: WebSocket | null;
};



// import 
export function SketchNavbar({ username, onToolSelect, onStrokeChange, roomId, token, Socket }: Props) {

  const [activeTool, setActiveTool] = useState<string | undefined>(undefined);
  // const [strokeStyle, setStrokeStyle] = useState("solid")
  const [showChat, setShowChat] = useState(false);
  const [activeStroke, setActiveStroke] = useState<StrokeStyle>("solid");


  const tools = [
    { id: "pencil", label: "Pencil", icon: <Pencil size={13} /> },
    { id: "rectangle", label: "Rectangle", icon: <Square size={13} /> },
    { id: "circle", label: "Circle", icon: <Circle size={13} /> },
    { id: "diamond", label: "Diamond", icon: <Diamond size={13} /> },
    { id: "arrow", label: "Arrow", icon: <ArrowRight size={13} /> },
    { id: "line", label: "Line", icon: <Minus size={13} /> },
    { id: "eraser", label: "Eraser", icon: <Eraser size={13} /> },
    { id: "insert", label: "Insert Image", icon: <Image size={13} /> },
    { id: "text", label: "Text", icon: <TextFormat size={20} className="text-white" /> },
    { id: "select", label: "Edit", icon: <MousePointer2 size={15} /> }
  ];

  const strokes = [
    {
      id: "solid",
      label: "Solid",
      class: "border-t-2 border-white w-3"
    },
    {
      id: "dashed",
      label: "Dashed",
      class: "border-t-2 border-dashed border-white w-3"
    },
    {
      id: "dotted",
      label: "Dotted",
      class: "border-t-2 border-dotted border-white w-3"
    },
    {
      id: "bold",
      label: "Bold",
      class: "border-t-4 border-white w-3"
    }
  ];


  const handleToolClick = (id: string) => {
    setActiveTool(id);

    onToolSelect?.(id); // trigger parent (Layout and canvas)
  };

  const handleStrokeClick = (style: StrokeStyle) => {
    setActiveStroke(style);
    onStrokeChange?.(style);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-12 bg-[#2b2b2b] border-b border-neutral-700 flex items-center justify-between px-4 z-[100]">

      <div className="flex gap-2">
        {/* <div className="w-7 h-7 bg-gold-300 rounded-md flex text-xl items-center justify-center font-bold text-white">
          S
        </div> */}

        <div
          style={{
            width: 25, height: 25,
            background: "linear-gradient(135deg,#FFD700,#C8860A)",
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display',serif",
            fontWeight: 700, fontSize: 16, color: "#fff",
            boxShadow: "0 2px 14px rgba(200,134,10,0.32)",
            flexShrink: 0,
          }}
        >
          S
        </div>

        <span className="text-white font-semibold text-sm">
           𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔
        </span>
      </div>

      {/* LEFT SIDE */}
      <div className="flex items-center gap-2">

        <span className="text-neutral-400 ml-4 text-sm">
          Toolbar
        </span>

        {/* SHAPE TOOLS */}
        <div className="flex items-center gap-2 ml-2">

          {tools.map((tool) => (
            <Tooltip title={tool.label} arrow key={tool.id}>
              <button
                onClick={() => handleToolClick(tool.id)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg border border-neutral-600 transition
      ${activeTool === tool.id
                    ? "bg-black text-white"
                    : "text-white hover:bg-neutral-700"
                  }`}
              >
                {tool.icon}
              </button>
            </Tooltip>
          ))}

          <span className="text-neutral-400 ml-4 text-sm">
            Styles
          </span>

          {/* STROKE STYLE */}
          {strokes.map((stroke) => (
            <Tooltip title={stroke.label} arrow key={stroke.id}>
              <button
                onClick={() => handleStrokeClick(stroke.id as StrokeStyle)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg border border-neutral-600 transition
      ${activeStroke === stroke.id
                    ? "bg-black text-white"
                    : "hover:bg-neutral-700"
                  }`}
              >
                <div className={stroke.class}></div>
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="flex gap-8">

        <button
          onClick={() => setShowChat(prev => !prev)}
          className="gap-1 p-1 w-auto h-8 flex items-center justify-center 
        bg-[#2b2b2b] 
        border border-neutral-600 
        
        rounded-md 
        text-white
        hover:bg-neutral-700 
        transition">
          <Users size={20} />
          Collaborate
        </button>


        {showChat && (
          <ChatCard
            roomId={roomId}
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            Socket={Socket}
          />
        )}

        <div className="w-7 h-7 md:1 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
          {username?.[0]?.toUpperCase()}
        </div>

      </div>

    </div>
  )
}   