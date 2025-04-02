import { Message } from "@domain/entities";
import { MessageDTO } from "../DTOs";

/**
 * Mapper class for converting between Message entities and MessageDTOs.
 */
export class MessageMapper {
  /**
   * Converts a Message entity to a MessageDTO.
   *
   * @param {Message} message - The Message entity to be converted.
   * @returns {MessageDTO} - The resulting MessageDTO.
   */
  static toDTO(message: Message): MessageDTO {
    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      conversationId: message.conversationId,
      messageType: message.messageType,
      extra: JSON.stringify(message.extra),
      replyToMessageId: message.replyToMessageId,
      createdAt: message.createdAt,
    };
  }

  /**
   * Converts a MessageDTO to a Message entity.
   *
   * @param {MessageDTO} messageDTO - The MessageDTO to be converted.
   * @returns {Message} - The resulting Message entity.
   */
  static toEntity(messageDTO: MessageDTO): Message {
    return new Message({
      id: messageDTO.id,
      content: messageDTO.content,
      senderId: messageDTO.senderId,
      conversationId: messageDTO.conversationId,
      messageType: messageDTO.messageType,
      extra: messageDTO.extra,
      replyToMessageId: messageDTO.replyToMessageId,
      createdAt: messageDTO.createdAt,
    });
  }
}
