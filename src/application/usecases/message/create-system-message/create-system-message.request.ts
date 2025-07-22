import { SystemMessageType } from "@domain/enums";

export interface ICreateSystemMessageRequest {
  conversationId: string;
  systemMessageType: SystemMessageType;
  relatedUser?: string;
}
