"use client"
import { useState } from 'react';
import { Pencil, Square, Circle, Diamond, ArrowRight, Minus, Users, Eraser, Image, Type } from "lucide-react"
import { ChatCard } from '../chat/ChatCard';
import { TextFormat } from '@/app/icon/Text';
import { StrokeStyle } from '@/types/DrawingShapesTypes';


type Props = {
  username?: string,
  onToolSelect?: (tool: string) => void;
  onStrokeChange?: (stroke: StrokeStyle) => void;
  roomId?:string
  token?:string
  Socket?: WebSocket | null;
};



// import 
export function SketchNavbar({ username, onToolSelect , onStrokeChange , roomId , token  , Socket}: Props) {

const [activeTool, setActiveTool] = useState<string | undefined>(undefined);
  // const [strokeStyle, setStrokeStyle] = useState("solid")
const [showChat, setShowChat] = useState(false);
const [activeStroke, setActiveStroke] = useState<StrokeStyle>("solid");


  const tools = [
    { id: "pencil", icon: <Pencil size={13} /> },
    { id: "rectangle", icon: <Square size={13} /> },
    { id: "circle", icon: <Circle size={13} /> },
    { id: "diamond", icon: <Diamond size={13} /> },
    { id: "arrow", icon: <ArrowRight size={13} /> },
    { id: "line", icon: <Minus size={13} /> },
    { id: "eraser", icon: <Eraser size={13} /> },
    { id: "insert", icon: <Image size={13} /> },
    { id: "text", icon: <TextFormat size={20} className="text-white" /> }

  ]

  const strokes = [
    { id: "solid", class: "border-t-2 border-white w-3" },
    { id: "dashed", class: "border-t-2 border-dashed border-white w-3" },
    { id: "dotted", class: "border-t-2 border-dotted border-white w-3" },
    { id: "bold", class: "border-t-4 border-white w-3" }
  ]


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
        <div className="w-7 h-7 bg-gold-300 rounded-md flex text-xl items-center justify-center font-bold text-white">
          S
        </div>

        <span className="text-white font-semibold text-sm">
          Sketch Link
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
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}

              className={`w-7 h-7 flex items-center justify-center rounded-lg border border-neutral-600 transition
              ${activeTool === tool.id
                  ? "bg-black text-white"
                  : "text-white hover:bg-neutral-700"}
              `}
            >
              {tool.icon}
            </button>
          ))}

          <span className="text-neutral-400 ml-4 text-sm">
            Styles
          </span>

          {/* STROKE STYLE */}
          {strokes.map((stroke) => (
            <button
              key={stroke.id}
              onClick={() =>handleStrokeClick(stroke.id as StrokeStyle)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg border border-neutral-600 transition
              ${activeStroke  === stroke.id
                  ? "bg-black text-white"
                  : "hover:bg-neutral-700"}
              `}
            >
              <div className={stroke.class}></div>
            </button>
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