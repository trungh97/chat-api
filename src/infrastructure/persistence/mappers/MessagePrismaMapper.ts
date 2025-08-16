import { IDetailedMessageRepositoryDTO } from "@domain/dtos";
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
  static fromDTOtoEntity(dto: IDetailedMessageRepositoryDTO): Message {
    return new Message(dto);
  }

  static fromPrismaModelToEntity(prismaModel: MessagePrismaModel): Message {
    const extra =
      typeof prismaModel.extra === "string"
        ? JSON.parse(prismaModel.extra)
        : prismaModel.extra;
    return new Message({ ...prismaModel, extra });
  }

  /**
   * Maps a MessagePrismaModel to IMessageRepositoryDTO.
   * @param {MessagePrismaModel} prismaModel - The Prisma model to map.
   * @returns {IMessageRepositoryDTO}
   */
  static fromPrismaModelToDetailDTO(
    prismaModel: MessagePrismaModel & { sender?: UserPrismaModel }
  ): IDetailedMessageRepositoryDTO {
    const sender = {
      firstName: prismaModel.sender?.firstName || "",
      lastName: prismaModel.sender?.lastName || "",
      avatar: prismaModel.sender?.avatar ?? null,
    };

    return {
      ...prismaModel,
      extra:
        typeof prismaModel.extra === "string"
          ? JSON.parse(prismaModel.extra)
          : null,
      sender,
    };
  }
}
