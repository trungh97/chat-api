import { Message } from "@domain/entities";
import { ConversationType } from "@domain/enums";
import { IDetailedParticipantUseCase } from "../participant/types";

export interface IDetailConversationUseCase {
  id: string;
  title: string;
  creatorId: string;
  isArchived: boolean;
  deletedAt: Date;
  type: keyof typeof ConversationType;
  groupAvatar?: string;
  lastMessageAt?: Date;
  defaultGroupAvatars?: string[];
}

export type ConversationUseCaseResponse = {
  conversation: IDetailConversationUseCase;
  participants?: IDetailedParticipantUseCase[];
  messages?: Message[];
};
