import { MessageStatus, MessageType } from "@domain/enums";

export interface IDetailedMessageRepositoryDTO {
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
  status: keyof typeof MessageStatus;
}
