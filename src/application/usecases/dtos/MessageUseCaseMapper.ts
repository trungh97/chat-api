import { IDetailedMessageRepositoryDTO } from "@domain/dtos";
import { Message } from "@domain/entities";
import { MessageWithSenderUseCaseDTO } from "../message";

export class MessageUseCaseMapper {
  static toUseCaseDTO(
    repoDto: IDetailedMessageRepositoryDTO
  ): MessageWithSenderUseCaseDTO {
    const senderData = repoDto.sender;
    const senderPayload = {
      name: `${senderData.firstName} ${senderData.lastName}`,
      avatar: senderData.avatar ?? null,
    };
    const message = new Message(repoDto);
    return new MessageWithSenderUseCaseDTO(message, senderPayload);
  }

  static toEntity(repoDto: IDetailedMessageRepositoryDTO): Message {
    return new Message(repoDto);
  }
}
