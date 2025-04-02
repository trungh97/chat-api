import { ConversationType } from "@domain/enums";

export interface ICreateConversationRequestDTO {
  title?: string;
  participants: string[];
}
