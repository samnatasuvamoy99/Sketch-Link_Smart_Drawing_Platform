import { WebSocket } from "ws";
import { userManager } from "./user.manager";
import { prisma } from "@repo/db/client";
import { cleanupSnapshotsByRoom, cleanupChatsByRoom ,saveMessage,saveCoordinate , cleanupRoomById}from"../services/room.service";

class RoomManager {
  private rooms: Map<string, Set<WebSocket>> = new Map();


  // JOIN ROOM (FIXED)
  async joinRoom(ws: WebSocket, roomId: string) {
    const user = userManager.getUser(ws);
    if (!user) return;



    let room = null;

    const MAX_RETRIES = 5;
    const DELAY = 300;

    for (let i = 0; i < MAX_RETRIES; i++) {
      room = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (room) break;

      await new Promise((r) => setTimeout(r, DELAY));
    }


    //room still not found
    if (!room) {
      ws.send(
        JSON.stringify({
          type: "join_error",
          message: "Room does not exist",
        })
      );
      return;
    }


    // ADD USER TO ROOM (MEMORY)

    if (!user.rooms.includes(roomId)) {
      user.rooms.push(roomId);
    }

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    this.rooms.get(roomId)!.add(ws);

    const membersOnline = this.rooms.get(roomId)!.size;

    ws.send(
      JSON.stringify({
        type: "join_success",
        payload: {
          success: true,
          roomId,
          roomName: room.slug || roomId,
          membersOnline,
          joinedAt: new Date().toISOString(),
        },
      })
    );

    console.log(`User joined room ${roomId} | Users: ${membersOnline}`);
  }


  
// ROOM MANAGER
async leaveRoom(ws: WebSocket, roomId: string) {
  const room = this.rooms.get(roomId);

  if (!room) return;

  // REMOVE USER
  room.delete(ws);

  console.log("Remaining users:", room.size);

  // IF ROOM EMPTY
  if (room.size === 0) {

    // DELETE ROOM FROM MEMORY
    this.rooms.delete(roomId);

    console.log(`Room deleted from memory: ${roomId}`);

    try {

      // DELETE COORDINATES
      await cleanupSnapshotsByRoom(roomId);

      // DELETE CHATS
      await cleanupChatsByRoom(roomId);

      // DELETE ROOM FROM DATABASE
      await cleanupRoomById(roomId);

      console.log("All room data deleted");

    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  }
}

async sendMessage(
  roomId: string,
  message: string,
  userId: string,
  clientId?: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    // FIRST SEND MESSAGE TO OTHER USERS IN SAME ROOM
    userManager.getUsers().forEach((u) => {
      if (!u.rooms.includes(roomId)) return;

      // DO NOT SEND BACK TO SENDER
      if (u.userId === userId) return;

      u.ws.send(
        JSON.stringify({
          type: "chat",
          roomId,
          message,
          userId,
          username: user?.username ?? null,
          clientId: clientId ?? null,
        })
      );
      console.log("successfully completed the msg")
    });

    // SAVE MESSAGE AFTER SENDING
    await saveMessage(roomId, message, userId);

  } catch (err) {
    console.error("SendMessage Error:", err);
  }
}



  // REALTIME DRAWING
  async sendShapes(roomId: string, coordinate: string) {
    try {
      console.log("Broadcasting drawing to room:", roomId);

      userManager.getUsers().forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "realtime_drawing",
              roomId,
              coordinate,
            })
          );
        }
      });

      await saveCoordinate(roomId, coordinate);
    } catch (err) {
      console.error("SendShapes Error:", err);
    }
  }



  //erase Coordinate
  async eraseShape(roomId: string, shapeId: string) {
    try {
      console.log("Erasing shape:", shapeId);

      //delete from DB
      await prisma.shape.deleteMany({
        where: { id: shapeId },
      });

      //broadcast erase to all users
      userManager.getUsers().forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "erase",
              shapeId,
              roomId
            })
          );
        }
      });

    } catch (err) {
      console.error("Erase Error:", err);
    }
  }


  //reset  method .........
  async resetCanvas(roomId: string) {
  try {

    // DELETE ALL SHAPES FROM DB
    await cleanupSnapshotsByRoom(roomId);

    // BROADCAST RESET TO EVERY USER
    userManager.getUsers().forEach((user) => {

      if (user.rooms.includes(roomId)) {

        user.ws.send(
          JSON.stringify({
            type: "reset_canvas",
            roomId,
          })
        );
      }
    });

    console.log("Canvas reset:", roomId);

  } catch (err) {
    console.error("Reset canvas error:", err);
  }
}
}

export const roomManager = new RoomManager();