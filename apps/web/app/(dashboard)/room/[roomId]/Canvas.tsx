"use client";
import { useState, useEffect, useRef } from "react";
import { SketchNavbar } from "@/components/layout/Navbar";
import { SketchSidebar } from "@/components/layout/Sidebar";
import { List } from "lucide-react";
import DrawingCanvas from "../../../../components/canvas/CanvasSocket";
import { CanvasRealtimeProps } from "@/types/DrawingShapesTypes";
import { getCurrentUserName } from "@/service/getCurrentDetails";
import { StrokeStyle } from "@/types/DrawingShapesTypes";
import type { StrokeWidth } from '@/types/Sidebarprops';
import { apiJoinRoomWS } from "@/service/RoomService";
import { WEBSOCKET_URL } from "@/config";
import { ChatCard } from "@/components/chat/ChatCard";
import { SketchEngine } from "@/drawingservice/engine/SketchEngine";
import { Error } from "@/components/ui/error";

//Navbar →Canvas(state) → DrawingCanvas → initSketch
export function Canvas({ roomId, token }: CanvasRealtimeProps) {



  const [showPage, setShowPage] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState<string>("pencil");
  const [color, setColor] = useState<string>("#fff");
  const [strokeWidth, setStrokeWidth] = useState<number>(1.5)
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
  const [mode, setMode] = useState<"home" | "draw">("home");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [showChat, setShowChat] = useState(false);
  const engineRef = useRef<SketchEngine | null>(null);
  const [engine, setEngine] = useState<SketchEngine | null>(null); 
  const [authError, setAuthError] = useState<string | null>(null);
  

useEffect(() => {

  async function connectRoom() {

    // USER NOT LOGGED IN
    if (!token) {

      setAuthError(
        "Please login to access this collaborative room."
      );

      return;
    }

    // ROOM INVALID
    if (!roomId) {

      setAuthError("Invalid room link.");

      return;
    }

    try {

      const ws = new WebSocket(
        `${WEBSOCKET_URL}?token=${token}`
      );

      ws.onopen = async () => {

        try {

          // JOIN ROOM
          await apiJoinRoomWS(ws, roomId);

          // SAVE SOCKET
          setSocket(ws);

        } catch (err) {

         // console.error(err);

          setAuthError(
            "Unable to join room."
          );

          ws.close();
        }
      };

      ws.onerror = () => {

        setAuthError(
          "WebSocket connection failed."
        );

      };

      ws.onclose = () => {

        console.log("WS closed");

        setSocket(null);

      };

    } catch (err) {

      console.error(err);

      setAuthError(
        "Please login first."
      );

    }
  }

  connectRoom();

}, [token, roomId]);



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

  //console.log(selectedTool);


if (authError) {

  return <Error error={authError} />;

}

  return (
    <div className="h-screen w-screen fixed bg-black overflow-hidden">

      <SketchNavbar username={username}
        onToolSelect={(tool) => {
          setMode("draw");
          setSelectedTool(tool)
        }}
        onStrokeChange={(style) => setStrokeStyle(style)}
        onInsertImage={() => engineRef.current?.insertImage()}
        roomId={roomId}
        token={token}
        Socket={socket}
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
        engine={engine} // PASS ENGINE
      />

      <ChatCard
        roomId={roomId}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        Socket={socket}
      />

      <DrawingCanvas Socket={socket} token={token} roomId={roomId} tool={selectedTool} color={color} strokeWidth={strokeWidth} strokeStyle={strokeStyle}
        onEngineReady={(eng) => {
          engineRef.current = eng;
          setEngine(eng); //  
        }}
      />
    </div>
  );
}