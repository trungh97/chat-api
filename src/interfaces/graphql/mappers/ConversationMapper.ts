import { ConversationUseCaseResponse } from "@application/usecases/conversation/types";
import { ExtendedParticipant } from "@application/usecases/participant/types";
import { Conversation, Message } from "@domain/entities";
import { ConversationDTO, ExtendConversationDTO } from "../dtos";

export class ConversationMapper {
  /**
   * Converts an ConversationUseCaseResponse to a FullConversationDTO.
   *
   * @param options - The ConversationUseCaseResponse containing the conversation details,
   *                  including conversation data, participants, and messages.
   * @returns A FullConversationDTO with mapped fields for conversation details,
   *          participants, and messages.
   */
  static toFullConversationDTO(
    options: ConversationUseCaseResponse
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
      lastMessageAt,
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
      lastMessageAt,
      participants: participantDTOS.map(
        (participantDTO) =>
          new ExtendedParticipant(
            participantDTO,
            participantDTO.name,
            participantDTO.avatar
          )
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
    const {
      id,
      title,
      creatorId,
      deletedAt,
      isArchived,
      type,
      groupAvatar,
      lastMessageAt,
    } = conversationDTO;
    return new Conversation({
      id,
      title,
      groupAvatar,
      creatorId,
      deletedAt,
      isArchived,
      type,
      lastMessageAt,
    });
  }
}
