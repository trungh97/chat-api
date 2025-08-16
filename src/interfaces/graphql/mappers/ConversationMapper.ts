import { ConversationUseCaseResponse } from "@application/usecases/conversation/types";
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
    const { conversation, participants, messages } = options;

    return {
      ...conversation,
      participants,
      messages,
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
