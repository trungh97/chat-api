import { ParticipantType } from "@domain/enums";

export interface ICreateParticipantRequestDTO {
  conversationId: string;
  userId: string;
  type: ParticipantType;
  customTitle?: string;
}

export type AddParticipantAndNotifyRequest = ICreateParticipantRequestDTO & {
  currentUserId: string;
};
