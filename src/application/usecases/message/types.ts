import { MessageType } from "@domain/enums";

export interface IMessageUseCaseDTO {
  id: string;
  senderId: string;
  sender: {
    name: string;
    avatar?: string | null;
  };
  content: string;
  extra?: Object;
  messageType: keyof typeof MessageType;
  replyToMessageId?: string;
  createdAt: Date;
  conversationId: string;
}
