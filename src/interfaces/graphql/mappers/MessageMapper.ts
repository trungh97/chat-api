import {
  IMessageWithConversationUseCaseDTO,
  IMessageWithSenderUseCaseDTO,
} from "@application/usecases/message";
import { Message } from "@domain/entities";
import { MessageWithConversation } from "@infrastructure/persistence/websocket/redis-pubsub";
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
   * @param {IMessageWithSenderUseCaseDTO} message - The Message entity to be converted.
   * @returns {MessageDTO} - The resulting MessageDTO.
   */
  static fromMessageWithSenderToDTO(
    message: IMessageWithSenderUseCaseDTO
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
   * @param {IMessageWithSenderUseCaseDTO} message - The Message entity to be converted.
   * @returns {MessageWithSenderDTO} - The resulting MessageWithSenderDTO.
   */
  static toDTOWithSender(
    data: IMessageWithSenderUseCaseDTO
  ): MessageWithSenderDTO {
    return {
      ...data,
      extra: typeof data.extra === "object" ? JSON.stringify(data.extra) : null,
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
    dto: IMessageWithConversationUseCaseDTO
  ): MessageWithConversationDTO {
    return {
      ...dto,
      extra: typeof dto.extra === "object" ? JSON.stringify(dto.extra) : null,
    };
  }

  static fromNewMessagePubSubToDTO(
    data: MessageWithConversation
  ): MessageWithConversationDTO {
    return {
      id: data.id,
      content: data.content,
      messageType: data.messageType,
      senderId: data.senderId,
      conversationId: data.conversationId,
      replyToMessageId: data.replyToMessageId,
      createdAt: data.createdAt,
      conversation: data.conversation,
      senderAvatar: data.senderAvatar,
      senderName: data.senderName,
      extra: typeof data.extra === "object" ? JSON.stringify(data.extra) : null,
    };
  }
}
