import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer } from "ws";
import { userManager } from "./manager/user.manager";
import { roomManager } from "./manager/room.manager";
import { checkUser } from "./validation/checkuser";


const wss = new WebSocketServer({ port: 8080 });


wss.on("connection", (ws, request) => {
  console.log("NEW CONNECTION");

  ws.on("error", (err) => {
    console.log("WS ERROR:", err);
  });

  const fullUrl = new URL(request.url!, "http://localhost:8080");

  const token = fullUrl.searchParams.get("token") || "";

  //   const cookies = cookie.parse(request.headers.cookie || "");
  // const token = cookies.token;

  console.log("Token:", token); //  debug

  if (!token) {
    ws.close();
    return;
  }

  const userId = checkUser(token);
  // const userId = "test_user";


  if (!userId) {
    ws.close(4001, "Unauthorized");
    return;
  }

  userManager.addUser({
    userId,
    rooms: [],
    ws
  });

  ws.on("message", async (data) => {
    try {
      const parseData = JSON.parse(data.toString());

      switch (parseData.type) {
        case "join_room":
          roomManager.joinRoom(ws, parseData.roomId);

          break;

        case "leave_room":
          roomManager.leaveRoom(ws, parseData.roomId);
          break;

        case "chat":
          roomManager.sendMessage(parseData.roomId, parseData.message, userId , parseData.clientId );
          break;

        case "realtime_drawing":
          roomManager.sendShapes(parseData.roomId, parseData.coordinate);
          break;

        case "erase":
          await roomManager.eraseShape(
            parseData.roomId,
            parseData.shapeId
          );
          break;

        case "reset_canvas":
        await roomManager.resetCanvas(parseData.roomId);
         break;  

         case "shape_update":
         await roomManager.sendShapes(parseData.roomId  ,parseData.coordinate);
         break;
      }

    } catch (err) {
      console.log("MESSAGE ERROR:", err);
      ws.send(JSON.stringify({ type: "error", message: "Invalid format" }));
    }
  });


  
ws.on("close", async () => {
  console.log("User disconnected");

  try {

    const rooms = userManager.getUserRooms(ws);

    for (const roomId of rooms) {
      await roomManager.leaveRoom(ws, roomId);
    }

    // REMOVE USER
    userManager.removeUser(ws);

  } catch (err) {
    console.error("Error during leaveRoom:", err);
  }
});

  ws.send(JSON.stringify({ type: "connected" }));
});