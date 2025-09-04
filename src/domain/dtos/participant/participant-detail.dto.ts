import { ParticipantType } from "@domain/enums";

export interface IDetailedParticipantDTO {
  id: string;
  userId: string;
  conversationId: string;
  type: keyof typeof ParticipantType;
  customTitle?: string;
  name: string;
  avatar: string;
  lastSeenAt?: Date;
  lastSeenMessageId?: string;
  lastReceivedMessageId?: string;
}
