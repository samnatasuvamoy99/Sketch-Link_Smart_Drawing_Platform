
import { CreateRoomResponse, JoinRoomResponse} from '../types/RoomType';
import { BACKEND_URL, FRONTEND_URL } from '../config';
import { getCurrentUser } from "./getCurrentDetails"
import { Message , MessageResponse } from '@/types/ChatType';





export async function apiCreateRoom(
  roomName: string,

): Promise<CreateRoomResponse> {

  const res = await fetch(`${BACKEND_URL}/message/v2/admin/chat/create-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ roomName }),
  });
  if (!res.ok) throw new Error("Failed to create room");


  // return res.json();
  const result = await res.json();
  console.log(result.id);

  if (!FRONTEND_URL) {
    throw new Error("FRONTEND_URL is not defined");
  }

  await new Promise((r) => setTimeout(r, 800));
  const id = result.roomId;
  alert(result.message);

  return {
    id,
    roomName,
    link: `${FRONTEND_URL}/room/${id}`,
    createdAt: new Date().toISOString(),
    membersOnline: 23

  };
}



export function apiJoinRoomWS(
  ws: WebSocket,
  roomId: string
): Promise<JoinRoomResponse> {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return reject(new Error("WebSocket not connected"));
    }

    const handler = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "join_success") {
        ws.removeEventListener("message", handler);
        resolve(data.payload);
      }

      if (data.type === "join_error") {
        ws.removeEventListener("message", handler);
        reject(new Error(data.message));
      }
    };

    ws.addEventListener("message", handler);

    ws.send(
      JSON.stringify({
        type: "join_room",
        roomId,
      })
    );
  });
}


/** Simulated API: fetch messages for a room */
export async function FetchMessages(roomId: string): Promise<Message[]> {
  const res = await fetch(
    `${BACKEND_URL}/message/v2/admin/chat/chats/${roomId}`,
    {
      method: "GET",
      credentials: "include", // if using auth cookies
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  const result:MessageResponse  = await res.json();

  //const currentUserId = await getCurrentUser(); // get the current userId;

//  return result.messages.map((msg: any) => ({
//     id: String(msg.id),
//     sender: msg.userId,
//     text: msg.message,
//     isSelf: msg.userId === currentUserId,
//     createdAt: msg.createdAt,
//   }));

  return result.messages;
}