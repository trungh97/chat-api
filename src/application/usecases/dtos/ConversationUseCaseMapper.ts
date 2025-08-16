import { Conversation } from "@domain/entities";
import { IDetailConversationUseCase } from "../conversation";

export class ConversationUseCaseMapper {
  /**
   * Maps a Conversation entity to a IDetailConversationUseCase.
   * @param entity The Conversation entity to be mapped.
   * @param defaultGroupAvatars The default group avatars.
   * @returns The mapped IDetailConversationUseCase.
   */
  static fromEntityToDetailUseCaseDTO(
    entity: Conversation,
    defaultGroupAvatars?: string[]
  ): IDetailConversationUseCase {
    return {
      id: entity.id,
      title: entity.title,
      creatorId: entity.creatorId,
      isArchived: entity.isArchived,
      deletedAt: entity.deletedAt,
      type: entity.type,
      groupAvatar: entity.groupAvatar,
      lastMessageAt: entity.lastMessageAt,
      defaultGroupAvatars,
    };
  }
}
