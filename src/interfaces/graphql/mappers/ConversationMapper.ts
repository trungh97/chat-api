import { Conversation, Message, Participant } from "@domain/entities";
import { FullConversationDTO } from "../DTOs";
import { IConversationResponseDTO } from "@domain/dtos/conversation";

export class ConversationMapper {
  /**
   * Maps a domain Conversation entity to a DTO.
   * @param conversation The conversation entity to be mapped.
   * @returns The mapped ConversationDTO.
   */
  static toDTO(options: IConversationResponseDTO): FullConversationDTO {
    const { conversation, participants = [], messages = [] } = options;
    const { id, title, creatorId, deletedAt, isArchived, type } = conversation;
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
  static toEntity(conversationDTO: FullConversationDTO): Conversation {
    const { id, title, creatorId, deletedAt, isArchived, type } =
      conversationDTO;
    return new Conversation({
      id,
      title,
      creatorId,
      deletedAt,
      isArchived,
      type,
    });
  }
}
