import { MessageType } from "@domain/enums";

export interface ICreateMessageRequestDTO {
  senderId: string;
  conversationId: string;
  content: string;
  extra: Object;
  messageType: MessageType;
  replyToMessageId: string;
}
