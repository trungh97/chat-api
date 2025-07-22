import { IMessageRepositoryDTO } from "@domain/dtos/message/IMessageRepositoryDTO";
import { IMessageUseCaseDTO } from "../message/create-message/create-message.response";

export class MessageUseCaseMapper {
  static toUseCaseDTO(repoDto: IMessageRepositoryDTO): IMessageUseCaseDTO {
    return {
      id: repoDto.id,
      senderId: repoDto.senderId,
      sender: {
        name: `${repoDto.sender.firstName} ${repoDto.sender.lastName}`,
        avatar: repoDto.sender.avatar ?? null,
      },
      content: repoDto.content,
      extra: repoDto.extra,
      messageType: repoDto.messageType,
      replyToMessageId: repoDto.replyToMessageId,
      createdAt: repoDto.createdAt,
    };
  }
}
