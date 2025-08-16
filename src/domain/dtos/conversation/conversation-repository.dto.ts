import { Conversation, Message } from "@domain/entities";
import { IDetailedParticipantDTO } from "../participant";

export interface IDetailConversationRepositoryDTO {
  conversation: Conversation;
  participants: IDetailedParticipantDTO[];
  messages: Message[];
}
