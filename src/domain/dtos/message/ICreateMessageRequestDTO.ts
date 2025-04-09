import { MessageType } from "@domain/enums";

export interface ICreateMessageRequestDTO {
  conversationId: string | null;
  content: string;
  extra?: Object;
  messageType: MessageType;
  replyToMessageId?: string;
  receivers?: string[];
}
