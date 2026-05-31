import {z} from "zod"


export const signupSchema = z.object({
  username:z.string().min(5 , "user-username must be 5 char").max(10),
  email :z.string().email("Invalid email address").max(102),
  password:z.string().min(5  ," user-password must be 5 char").max(132),
  photoUrl:z.string().url("Invalid photo URL").optional()
});

export const signinSchema = z.object({
   email:z.string().email("Invalid email address").max(102),
   password:z.string().min( 5 , "user-password must be 5 char").max(132)
})

export const CreateRoomSchema = z.object({
    roomName: z.string().min(3).max(20),
})

export const ChatRooms_Id = z.string().uuid("Invalid Room ID format");

export type ChatRoomIdType = z.infer<typeof ChatRooms_Id>;




export const Room_Id = z.object({
  roomId: z.string().uuid("Invalid Room ID format"),
});

export type RoomId = z.infer<typeof Room_Id>;