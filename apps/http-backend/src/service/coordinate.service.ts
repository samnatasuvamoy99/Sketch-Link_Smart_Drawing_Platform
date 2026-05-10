import {ChatRoomId} from "../schema/data_validation.schema.js";
import { prisma } from "@repo/db/client";




export const FetchCoordinate = async (body: any) => {
  const parsed = ChatRoomId.safeParse(body);

  if (!parsed.success) {
    throw new Error("RoomId not Found");
  }

  const Coordinate = await prisma.shape.findMany({
    where: {
      roomId: parsed.data,
      createdAt: {
        gt: new Date(Date.now() - 1000 * 60 * 30) // last 30 mins
      }
    },
    orderBy: {
      createdAt: "asc" 
    }
    
  });

  return Coordinate;
};