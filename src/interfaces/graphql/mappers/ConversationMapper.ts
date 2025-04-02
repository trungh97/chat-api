import { Conversation, Message, Participant } from "@domain/entities";
import { ConversationDTO } from "../DTOs";

export class ConversationMapper {
  /**
   * Maps a domain Conversation entity to a DTO.
   * @param conversation The conversation entity to be mapped.
   * @returns The mapped ConversationDTO.
   */
  static toDTO(conversation: Conversation): ConversationDTO {
    return {
      id: conversation.id,
      title: conversation.title,
      creatorId: conversation.creatorId,
      deletedAt: conversation.deletedAt,
      isArchived: conversation.isArchived,
      type: conversation.type,
      participants: conversation.participants.map(
        (participant) =>
          new Participant({
            id: participant.id,
            userId: participant.userId,
            conversationId: participant.conversationId,
            type: participant.type,
          })
      ),
      messages: conversation.messages.map((message) => {
        console.log(message);
        return new Message({
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          messageType: message.messageType,
          extra: message.extra,
          replyToMessageId: message.replyToMessageId,
          createdAt: message.createdAt,
        });
      }),
    };
  }

  /**
   * Maps a ConversationDTO to a domain Conversation entity.
   * @param conversationDTO The ConversationDTO to be mapped.
   * @returns The mapped Conversation entity.
   */
  static toEntity(conversationDTO: ConversationDTO): Conversation {
    return new Conversation(conversationDTO);
  }
}
