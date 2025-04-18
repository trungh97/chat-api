import { Conversation, Message, Participant } from "@domain/entities";
import { ParticipantWithNameDTO } from "../participant";

export interface IConversationResponseDTO {
  conversation: Conversation;
  participants?: ParticipantWithNameDTO[] | Participant[];
  messages?: Message[];
}
