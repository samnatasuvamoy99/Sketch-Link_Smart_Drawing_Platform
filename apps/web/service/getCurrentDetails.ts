import { BACKEND_URL } from "@/config";

type RoomSlugResponse = {
  slug: string;
};

//this is the current userId ;
export async function getCurrentUser() {
  const res = await fetch(`${BACKEND_URL}/api/v1/user/auth/api/me`, {
    credentials: "include",
  });

  const user = await res.json();
  return user;
}


//get roomId through current login user...
export async function getCurrentUserRoomId() {

  const res = await fetch(`${BACKEND_URL}/fetchRomId/v3/from/adminId`, {
    credentials: "include",
  })
   
  
    if (!res.ok) {
    throw new Error("failed fetch adminId");
  }

  const roomId =  await res.json();
  return roomId;

}


// get username
export async function getCurrentUserName() {
  const res = await fetch(`${BACKEND_URL}/fetchRomId/v3/username`, {
    credentials: "include",
  })
   
  
    if (!res.ok) {
    throw new Error("failed fetch  username");
  }

  const  username =  await res.json();
  return username;

}


//get room-name using roomId
export async function getCurrentRoomSlug(roomId: string) {
  const res = await fetch(
    `${BACKEND_URL}/message/v2/admin/chat/chatroom/slug`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ roomId }), 
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch room slug");
  }

  const data = await res.json();
  return data.slug;
}

