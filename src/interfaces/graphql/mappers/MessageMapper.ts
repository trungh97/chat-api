import { IMessageUseCaseDTO } from "@application/usecases/message/types";
import { Message } from "@domain/entities";
import { MessageDTO, MessageWithSenderDTO } from "../dtos";

/**
 * Mapper class for converting between Message entities and MessageDTOs.
 */
export class MessageMapper {
  /**
   * Converts a Message entity to a MessageDTO.
   *
   * @param {IMessageUseCaseDTO} message - The Message entity to be converted.
   * @returns {MessageDTO} - The resulting MessageDTO.
   */
  static toDTO({
    id,
    content,
    senderId,
    conversationId,
    messageType,
    extra,
    replyToMessageId,
    createdAt,
  }: IMessageUseCaseDTO): MessageDTO {
    return {
      id,
      content,
      senderId,
      conversationId,
      messageType,
      extra: JSON.stringify(extra),
      replyToMessageId,
      createdAt,
    };
  }

  /**
   * Converts a Message entity to a MessageWithSenderDTO.
   *
   * @param {IMessageUseCaseDTO} message - The Message entity to be converted.
   * @returns {MessageWithSenderDTO} - The resulting MessageWithSenderDTO.
   */
  static toDTOWithSender({
    id,
    content,
    senderId,
    conversationId,
    messageType,
    extra,
    replyToMessageId,
    createdAt,
    sender,
  }: IMessageUseCaseDTO): MessageWithSenderDTO {
    return {
      id,
      content,
      senderId,
      conversationId,
      messageType,
      extra: JSON.stringify(extra),
      replyToMessageId,
      createdAt,
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
    return new Message(messageDTO);
  }
}
