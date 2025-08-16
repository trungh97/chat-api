import { IDetailConversationRepositoryDTO } from "@domain/dtos";
import { Conversation } from "@domain/entities";
import {
  Conversation as ConversationPrismaModel,
  Message as MessagePrismaModel,
  Participant as ParticipantPrismaModel,
} from "@prisma/client";
import { MessagePrismaMapper } from "./MessagePrismaMapper";
import { ParticipantPrismaMapper } from "./ParticipantPrismaMapper";

/**
 * Mapper class for converting between Conversation entity, Prisma model, and IConversationRepositoryDTO.
 */
export class ConversationPrismaMapper {
  /**
   * Maps a ConversationPrismaModel to Conversation entity.
   * @param {ConversationPrismaModel} prismaModel - The Prisma model to map.
   * @returns {Conversation} The corresponding Conversation entity.
   */
  static fromPrismaModelToEntity(
    prismaModel: ConversationPrismaModel
  ): Conversation {
    return new Conversation(prismaModel);
  }

  /**
   * Maps a ConversationPrismaModel, an array of ParticipantPrismaModel and an array of MessagePrismaModel to
   * IDetailConversationRepositoryDTO.
   * @param {ConversationPrismaModel} conversationPrismaModel - The ConversationPrismaModel to map.
   * @param {Array<ParticipantPrismaModel>} [participantsPrismaModel=[]] - The array of ParticipantPrismaModel to map.
   * @param {Array<MessagePrismaModel>} [messagesPrismaModel=[]] - The array of MessagePrismaModel to map.
   * @returns {IDetailConversationRepositoryDTO}
   */
  static fromPrismaToDetailConversationDTO({
    conversationPrismaModel,
    participantsPrismaModel = [],
    messagesPrismaModel = [],
  }: {
    conversationPrismaModel: ConversationPrismaModel;
    participantsPrismaModel?: (ParticipantPrismaModel & {
      user?: { firstName: string; lastName: string; avatar: string };
    })[];
    messagesPrismaModel?: MessagePrismaModel[];
  }): IDetailConversationRepositoryDTO {
    return {
      conversation: this.fromPrismaModelToEntity(conversationPrismaModel),
      participants: participantsPrismaModel.map(
        ParticipantPrismaMapper.fromPrismaModelToDetailDTO
      ),
      messages: messagesPrismaModel.map(
        MessagePrismaMapper.fromPrismaModelToEntity
      ),
    };
  }
}
