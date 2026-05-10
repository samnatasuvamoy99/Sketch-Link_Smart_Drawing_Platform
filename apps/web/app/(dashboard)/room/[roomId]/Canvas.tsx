"use client";
import { useState, useEffect  , useRef} from "react";
import { SketchNavbar } from "@/components/layout/Navbar";
import { SketchSidebar } from "@/components/layout/Sidebar";
import { List } from "lucide-react";
import DrawingCanvas from "../../../../components/canvas/CanvasSocket";
import { CanvasRealtimeProps } from "@/types/DrawingShapesTypes";
import { getCurrentUserName } from "@/service/getCurrentDetails";
import { StrokeStyle } from "@/types/DrawingShapesTypes";
import type { StrokeWidth} from '@/types/Sidebarprops';
import { apiJoinRoomWS } from "@/service/RoomService";
import { WEBSOCKET_URL } from "@/config";
import { ChatCard } from "@/components/chat/ChatCard";
import { SketchEngine } from "@/drawingservice/engine/SketchEngine";


//Navbar →Canvas(state) → DrawingCanvas → initSketch
export function Canvas({ roomId, token }: CanvasRealtimeProps) {



  const [showPage, setShowPage] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState<string>("pencil");
  const [color, setColor] = useState<string>("#FFFFFF");
  const [strokeWidth, setStrokeWidth] = useState<number>(1.5)
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
  const [mode, setMode] = useState<"home" | "draw">("home");
  const socketRef = useRef<WebSocket | null>(null);
  const [showChat, setShowChat] = useState(false);
  const engineRef = useRef<SketchEngine | null>(null);

//  Canvas.tsx
//    │
//    └── ONE websocket
//            │
//            ├── DrawingCanvas
//            └── ChatCard


useEffect(() => {
  if (!token ) return;

  const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);

 

    socketRef.current = ws;

  
}, [token]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getCurrentUserName();
        setUsername(data.username);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, []);

  console.log(selectedTool);

  return (
    <div className="h-screen w-screen fixed bg-black overflow-hidden">

      <SketchNavbar username={username} 
        onToolSelect={(tool) => {
          setMode("draw");
          setSelectedTool(tool)
        }}
        onStrokeChange={(style) => setStrokeStyle(style)}
        roomId={roomId}
        token={token}
        Socket={socketRef.current}
    />


      <div className="pt-16 pl-4 absolute z-20">
        <button
          onClick={() => setShowPage((prev) => !prev)}
          className="text-white hover:text-yellow-400 transition"
        >
          <List size={23} />
        </button>
      </div>

      <SketchSidebar
        isOpen={showPage}
        onClose={() => setShowPage(false)}
        onColorChange={(color) => setColor(color)}
        onStrokeWidthChange={(width) => setStrokeWidth(width)}
    onReset={() => {
    engineRef.current?.resetCanvas();
  }}
        
      />

      <ChatCard
     roomId={roomId}
    isOpen={showChat}
    onClose={() => setShowChat(false)}
    Socket={socketRef.current}
    />

      <DrawingCanvas token={token} roomId={roomId} tool={selectedTool} color={color} strokeWidth={strokeWidth}  strokeStyle={strokeStyle}
      onEngineReady={(engine) => {
  engineRef.current = engine;
}}
/>
    </div>
  );
}