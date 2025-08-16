import { Conversation } from "@domain/entities";
import { MessageType } from "@domain/enums";

export interface IMessageWithSenderUseCaseDTO {
  id: string;
  content: string;
  messageType: keyof typeof MessageType;
  senderId: string;
  conversationId: string;
  replyToMessageId?: string;
  createdAt: Date;
  extra?: string;
  senderName: string;
  senderAvatar: string | null;
}

export interface IMessageWithConversationUseCaseDTO
  extends IMessageWithSenderUseCaseDTO {
  conversation: Conversation;
}
