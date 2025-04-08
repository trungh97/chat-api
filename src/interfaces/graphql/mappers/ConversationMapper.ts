import { Conversation, Message, Participant } from "@domain/entities";
import { ConversationDTO } from "../DTOs";

export class ConversationMapper {
  /**
   * Maps a domain Conversation entity to a DTO.
   * @param conversation The conversation entity to be mapped.
   * @returns The mapped ConversationDTO.
   */
  static toDTO({
    id,
    title,
    creatorId,
    deletedAt,
    isArchived,
    type,
    participants,
    messages,
  }: Conversation): ConversationDTO {
    return {
      id,
      title,
      creatorId,
      deletedAt,
      isArchived,
      type,
      participants: participants.map(
        (participant) => new Participant(participant)
      ),
      messages: messages.map((message) => {
        return new Message(message);
      }),
    };
  }

  /**
   * Maps a ConversationDTO to a domain Conversation entity.
   * @param conversationDTO The ConversationDTO to be mapped.
   * @returns The mapped Conversation entity.
   */
  static toEntity(conversationDTO: ConversationDTO): Conversation {
    return new Conversation(conversationDTO);
  }
}
