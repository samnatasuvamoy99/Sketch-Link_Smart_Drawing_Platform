import express ,{Router} from "express";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { createRoomController ,chatAllMessages , roomIdFromSlug , SlugUsingRoom} from "../controllers/chatroom.controller.js";

const roomRouter :Router = express.Router();

roomRouter.post("/create-room",AuthMiddleware,createRoomController);
roomRouter.get("/chats/:roomId" , AuthMiddleware, chatAllMessages ); // take  all messages
roomRouter.get("chatroom/:slugName", AuthMiddleware , roomIdFromSlug); //slugName->roomId
roomRouter.post("/chatroom/slug", AuthMiddleware, SlugUsingRoom);   //RoomId->slugName

export default roomRouter;