
import { CreateRoomService ,ChatsRoomMessage,RoomIdUsingSlug , SlugUsingRoomID} from "../service/chatroom.service.js";
import { Request, Response } from "express";
import { ChatRoomId ,fetchRoomId} from "../schema/data_validation.schema.js";



export const createRoomController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user_Id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const room = await CreateRoomService(req.body, userId);

    res.status(201).json({
      message: "Room created successfully",
      roomId:room.id,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// get all messages from the chat....
 export const chatAllMessages = async (req: Request, res: Response) => {
  try {
    // Validate roomId
    const parsed = ChatRoomId.safeParse(req.params.roomId);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid Room ID",
      });
    }

    // Fetch messages
    const messages = await ChatsRoomMessage(parsed.data);
    console.log("hiii");
    return res.status(200).json({
      success: true,
      messages,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

//find roomId from slug
export const roomIdFromSlug = async (req: Request, res: Response) => {
  try {
    
    const parsed = ChatRoomId.safeParse(req.params.slug);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid Room ID",
      });
    }

    
    const roomId = await RoomIdUsingSlug(parsed.data);

    return res.status(200).json({
      message: "Messages fetched successfully",
      roomId,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};



//find Slug from roomId
export const SlugUsingRoom = async (req: Request, res: Response) => {
  try {
    
    const parsed = fetchRoomId.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid Room ID",
      });
    }

    
   const SlugName = await SlugUsingRoomID(parsed.data.roomId);

    return res.status(200).json({
      slug: SlugName?.slug
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};
