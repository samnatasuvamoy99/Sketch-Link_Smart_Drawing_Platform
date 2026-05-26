import {prisma} from "@repo/db/client";

export async function cleanupSnapshotsByRoom(roomId: string) {


  console.log("Cleaning old snapshots for room:", roomId);

  const result = await prisma.shape.deleteMany({
    where: {
      roomId
    },
  });

  console.log(
    `Old snapshots deleted for room ${roomId}:`,
    result.count
  );

  return result.count;
}

  // store message in db 
 export async function saveMessage(roomId: string, message: string, userId: string) {

  const room = await prisma.room.findUnique({
    where: { id: roomId }
  });

  if (!room) {
    throw new Error(`Room ${roomId} does not exist`);
  }

  await prisma.chat.create({
    data: {
      message,
      roomId: roomId,
      userId: userId
    }
  });

  console.log("database pushed the message");
}

// saver coordinate in database
// export async function saveCoordinate(roomId: string,  coordinate:any) {
//       const parsed = JSON.parse(coordinate);
//       const shape = parsed.shape;

//   if (!shape?.id || !shape?.type) {
//     console.log("Invalid shape:", shape);
//     return;
//   }


//   const room = await prisma.room.findUnique({
//     where: { id: roomId }
//   });

//   if (!room) {
//     throw new Error(`Room ${roomId} does not exist`);
//   }

//   await prisma.shape.create({
//     data: {
//        id: shape.id, 
//       roomId: roomId,
//       type: shape.type, 
//       coordinates:shape
     
//     }
//   });


//   console.log("database pushed the coordinates");
// }


export async function saveCoordinate(roomId: string, coordinate: any) {
  const parsed = JSON.parse(coordinate);
  const shape = parsed.shape;

  if (!shape?.id || !shape?.type) {
    console.log("Invalid shape:", shape);
    return;
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error(`Room ${roomId} does not exist`);

  // upsert: update if exists, create if not
  await prisma.shape.upsert({
    where: { id: shape.id },
    update: { coordinates: shape },
    create: {
      id: shape.id,
      roomId,
      type: shape.type,
      coordinates: shape,
    },
  });

  console.log("database upserted the coordinates");
}


//update coordinate

export async function updateCoordinate(roomId: string, shape: any) {
  await prisma.shape.upsert({
    where: { id: shape.id },
    update: { coordinates: JSON.stringify(shape) },
    create: { id: shape.id,  type:shape.type ,roomId, coordinates: JSON.stringify(shape) },
  });
}

// DELETE CHAT 
export async function cleanupChatsByRoom(roomId: string) {

  console.log("Deleting chats for room:", roomId);

  const result = await prisma.chat.deleteMany({
    where: {
      roomId,
    },
  });

  console.log("Chats deleted:", result.count);

  return result.count;
}

// DELETE ROOM FROM DATABASE

export async function cleanupRoomById(roomId: string) {
  console.log("Deleting room from database:", roomId);

  const result = await prisma.room.delete({
    where: {
      id: roomId,
    },
  });

  console.log("Room deleted from DB:", result.id);

  return result;
}