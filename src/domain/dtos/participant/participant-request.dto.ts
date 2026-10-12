import { ParticipantType } from "@domain/enums";

export interface ICreateParticipantRequestDTO {
  conversationId: string;
  userId: string;
  type: ParticipantType;
  customTitle?: string;
}

/**
 * Moves a participant's last seen/received pointer to a message. `messageCreatedAt` is that
 * message's `createdAt`; pointers are ordered by `(messageCreatedAt, messageId)`.
 */
export interface IParticipantPointerUpdateDTO {
  participantId: string;
  messageId: string;
  messageCreatedAt: Date;
}
