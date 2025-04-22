import { Conversation, Message, Participant } from "@domain/entities";
import { ExtendConversationDTO, ConversationDTO } from "../DTOs";
import { IConversationResponseDTO } from "@domain/dtos/conversation";

export class ConversationMapper {
  /**
   * Converts an IConversationResponseDTO to a FullConversationDTO.
   *
   * @param options - The IConversationResponseDTO containing the conversation details,
   *                  including conversation data, participants, and messages.
   * @returns A FullConversationDTO with mapped fields for conversation details,
   *          participants, and messages.
   */
  static toFullConversationDTO(
    options: IConversationResponseDTO
  ): ExtendConversationDTO {
    const {
      conversation,
      participants: participantDTOS = [],
      messages: messageDTOS = [],
    } = options;
    const {
      id,
      title,
      creatorId,
      deletedAt,
      isArchived,
      type,
      groupAvatar,
      defaultGroupAvatar,
    } = conversation;

    return {
      id,
      title,
      groupAvatar,
      creatorId,
      deletedAt,
      isArchived,
      type,
      defaultGroupAvatar,
      participants: participantDTOS.map(
        (participantDTO) => new Participant(participantDTO)
      ),
      messages: messageDTOS.map((messageDTO) => new Message(messageDTO)),
    };
  }

  static toConversationDTO(conversation: Conversation): ConversationDTO {
    return conversation;
  }

  /**
   * Maps a ConversationDTO to a domain Conversation entity.
   * @param conversationDTO The ConversationDTO to be mapped.
   * @returns The mapped Conversation entity.
   */
  static toEntity(conversationDTO: ExtendConversationDTO): Conversation {
    const { id, title, creatorId, deletedAt, isArchived, type, groupAvatar } =
      conversationDTO;
    return new Conversation({
      id,
      title,
      groupAvatar,
      creatorId,
      deletedAt,
      isArchived,
      type,
    });
  }
}
