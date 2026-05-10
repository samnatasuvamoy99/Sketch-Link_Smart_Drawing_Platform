
import { WebSocket } from "ws";
import { ConnectedUser } from "../../types";

export class UserManager {
  private users: ConnectedUser[] = [];

  addUser(user: ConnectedUser) {
    this.users.push(user);
  }

  removeUser(ws: WebSocket) {
    this.users = this.users.filter((user) => user.ws !== ws);
  }

  getUser(ws: WebSocket) {
    return this.users.find((user) => user.ws === ws);
  }

  getUsers() {
    return this.users;
  }

  //get all rooms of a user
  getUserRooms(ws: WebSocket): string[] {
    const user = this.getUser(ws);
    return user?.rooms || [];
  }

  //remove user from specific room
  removeUserFromRoom(ws: WebSocket, roomId: string) {
    const user = this.getUser(ws);
    if (!user) return;

    user.rooms = user.rooms.filter((r) => r !== roomId);
  }

   getUserById(userId: string) {
    return this.users.find((user) => user.userId === userId) ?? null;
  }
  
}

export const userManager = new UserManager();