
import {prisma} from "@repo/db/client"
import { userRoomSchema ,ChatRoomId ,fetchRoomId} from "../schema/data_validation.schema.js";


export const CreateRoomService = async (body :any , userId: string)=>{
     
   const parseData =userRoomSchema.safeParse(body);

     if(!parseData.success){
         throw new Error("Invalid input provide correct input....!");
     }

     const {roomName} = parseData.data;

     if(!roomName){
       throw new Error("USER_ROOM_NAME_NOT_FOUND");
     }

     if (!userId) {
  throw new Error("User not authenticated");
   }

   
     const room = await prisma.room.create({
         data:{
          slug:roomName,
          adminId:userId
         }

     });

   return room;
}

// Service -> fetch messages from db 
export const ChatsRoomMessage = async (body: any) => {
  const parsed = ChatRoomId.safeParse(body);

  if (!parsed.success) {
    throw new Error("RoomId not Found");
  }

  const messages = await prisma.chat.findMany({
    where: {
       roomId:parsed.data
      },
    orderBy:{
        id:"desc"
    },
    take:50,
    include: {
      user: {
        select: { username: true }, //join username
      },
    },
  });

  return messages;
};

//Service -> fetch roomId using slug from db...
export const RoomIdUsingSlug = async (body: any) => {
  const parsed = ChatRoomId.safeParse(body);

  if (!parsed.success) {
    throw new Error("RoomId not Found");
  }

  const slugRoomId = await prisma.room.findFirst({
    where: {
       slug:parsed.data
      }
  });

  return slugRoomId;
};



//Service -> fetch slug using RoomId from db...
// 
export const SlugUsingRoomID = async (roomId: string) => {
  return prisma.room.findUnique({
    where: {
      id: roomId, //  must be string
    },
    select: {
      slug: true,
    },
  });
};