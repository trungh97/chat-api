import { IDetailedMessageRepositoryDTO } from "@domain/dtos";
import { Message } from "@domain/entities";
import { IMessageWithSenderUseCaseDTO } from "../message";

export class MessageUseCaseMapper {
  static toUseCaseDTO(
    repoDto: IDetailedMessageRepositoryDTO
  ): IMessageWithSenderUseCaseDTO {
    const senderData = repoDto.sender;
    const senderPayload = {
      name: `${senderData.firstName} ${senderData.lastName}`,
      avatar: senderData.avatar ?? null,
    };

    return {
      ...repoDto,
      extra:
        typeof repoDto.extra === "object"
          ? JSON.stringify(repoDto.extra)
          : null,
      senderName: senderPayload.name,
      senderAvatar: senderPayload.avatar,
    };
  }

  static toEntity(repoDto: IDetailedMessageRepositoryDTO): Message {
    return new Message(repoDto);
  }
}
