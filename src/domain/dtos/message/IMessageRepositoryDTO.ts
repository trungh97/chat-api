import { MessageType } from "@domain/enums";

export interface IMessageRepositoryDTO {
  id: string;
  senderId: string;
  sender: {
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  content: string;
  extra?: Object;
  messageType: keyof typeof MessageType;
  replyToMessageId?: string;
  createdAt: Date;
  conversationId: string;
}
