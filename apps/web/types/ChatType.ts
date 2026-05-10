 export interface Message {
  id:string;
  sender: string;
  text: string;
  senderName: string | null;
  isSelf: boolean;
  createdAt?: Date
}

export type MessageResponse = {
  messages: any[];
};

export interface ChatCardProps {
  Socket?: WebSocket | null;
  roomId?: string;
  isOpen: boolean;
  onClose?: () => void;
}