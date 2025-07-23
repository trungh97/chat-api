export interface ICreateConversationRequestDTO {
  title?: string;
  lastMessageAt?: Date;
  participants: string[];
}

export type CreateConversationRequest = ICreateConversationRequestDTO & {
  userId: string;
};
