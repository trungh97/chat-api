import { ParticipantType } from "@domain/enums";

export interface IDetailedParticipantUseCase {
  id: string;
  userId: string;
  conversationId: string;
  type: keyof typeof ParticipantType;
  customTitle?: string;
  name: string;
  avatar: string;
}
