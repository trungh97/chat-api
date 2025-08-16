import {
  MessageWithConversationUseCaseDTO,
  MessageWithSenderUseCaseDTO,
} from "@application/usecases/message/types";
import { Message } from "@domain/entities";
import {
  MessageDTO,
  MessageWithConversationDTO,
  MessageWithSenderDTO,
} from "../dtos";

/**
 * Mapper class for converting between Message entities and MessageDTOs.
 */
export class MessageMapper {
  /**
   * Converts a Message entity to a MessageDTO.
   *
   * @param {MessageWithSenderUseCaseDTO} message - The Message entity to be converted.
   * @returns {MessageDTO} - The resulting MessageDTO.
   */
  static fromMessageWithSenderToDTO(
    message: MessageWithSenderUseCaseDTO
  ): MessageDTO {
    return {
      id: message.id,
      content: message.content,
      messageType: message.messageType,
      senderId: message.senderId,
      conversationId: message.conversationId,
      replyToMessageId: message.replyToMessageId,
      createdAt: message.createdAt,
      extra: message.extra ? JSON.stringify(message.extra) : null,
    };
  }

  /**
   * Converts a Message entity to a MessageWithSenderDTO.
   *
   * @param {MessageWithSenderUseCaseDTO} message - The Message entity to be converted.
   * @returns {MessageWithSenderDTO} - The resulting MessageWithSenderDTO.
   */
  static toDTOWithSender(
    data: MessageWithSenderUseCaseDTO
  ): MessageWithSenderDTO {
    const sender = data.sender;

    return {
      id: data.id,
      content: data.content,
      messageType: data.messageType,
      senderId: data.senderId,
      conversationId: data.conversationId,
      replyToMessageId: data.replyToMessageId,
      createdAt: data.createdAt,
      extra: data.extra ? JSON.stringify(data.extra) : null,
      senderName: sender.name,
      senderAvatar: sender.avatar,
    };
  }

  /**
   * Converts a MessageDTO to a Message entity.
   *
   * @param {MessageDTO} messageDTO - The MessageDTO to be converted.
   * @returns {Message} - The resulting Message entity.
   */
  static toEntity(messageDTO: MessageDTO): Message {
    const extra = messageDTO.extra ? JSON.parse(messageDTO.extra) : null;
    return new Message({ ...messageDTO, extra });
  }

  static toDTOWithConversation(
    dto: MessageWithConversationUseCaseDTO
  ): MessageWithConversationDTO {
    return {
      id: dto.id,
      content: dto.content,
      messageType: dto.messageType,
      senderId: dto.senderId,
      conversationId: dto.conversationId,
      replyToMessageId: dto.replyToMessageId,
      createdAt: dto.createdAt,
      extra: typeof dto.extra === "object" ? JSON.stringify(dto.extra) : null,
      conversation: dto.conversation,
    };
  }
}
