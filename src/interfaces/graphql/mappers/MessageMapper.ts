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
  static toDTO({
    id,
    content,
    senderId,
    conversationId,
    messageType,
    extra,
    replyToMessageId,
    createdAt,
  }: Message): MessageDTO {
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
   * Converts a MessageDTO to a Message entity.
   *
   * @param {MessageDTO} messageDTO - The MessageDTO to be converted.
   * @returns {Message} - The resulting Message entity.
   */
  static toEntity(messageDTO: MessageDTO): Message {
    return new Message(messageDTO);
  }
}
