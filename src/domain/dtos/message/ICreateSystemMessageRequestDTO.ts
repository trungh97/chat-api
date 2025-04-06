import { SystemMessageType } from "@domain/enums";

export interface ICreateSystemMessageRequestDTO {
  conversationId: string;
  systemMessageType: SystemMessageType;
  relatedUser?: string;
}
