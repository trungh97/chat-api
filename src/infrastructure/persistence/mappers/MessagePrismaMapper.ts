import { IMessageRepositoryDTO } from "@domain/dtos/message";
import { Message } from "@domain/entities/Message";
import {
  Message as MessagePrismaModel,
  User as UserPrismaModel,
} from "@prisma/client";

/**
 * Mapper class for converting between Message entity, Prisma model, and IMessageRepositoryDTO.
 */
export class MessagePrismaMapper {
  /**
   * Maps an IMessageRepositoryDTO to a Message entity.
   */
  static fromDTOtoEntity(dto: IMessageRepositoryDTO): Message {
    return new Message({
      id: dto.id,
      senderId: dto.senderId,
      conversationId: "", // You may need to provide this from elsewhere
      content: dto.content,
      extra: dto.extra,
      messageType: dto.messageType,
      replyToMessageId: dto.replyToMessageId,
      createdAt: dto.createdAt,
    });
  }

  /**
   * Maps a MessagePrismaModel to IMessageRepositoryDTO.
   * @param {MessagePrismaModel} prismaModel - The Prisma model to map.
   * @returns {IMessageRepositoryDTO}
   */
  static fromPrismaModelToDTO(
    prismaModel: MessagePrismaModel & { sender?: UserPrismaModel }
  ): IMessageRepositoryDTO {
    return {
      id: prismaModel.id,
      senderId: prismaModel.senderId,
      sender: {
        firstName: prismaModel.sender?.firstName || "",
        lastName: prismaModel.sender?.lastName || "",
        avatar: prismaModel.sender?.avatar || null,
      },
      content: prismaModel.content,
      extra: prismaModel.extra,
      messageType: prismaModel.messageType,
      replyToMessageId: prismaModel.replyToMessageId,
      createdAt: prismaModel.createdAt,
      conversationId: prismaModel.conversationId,
    };
  }
}
