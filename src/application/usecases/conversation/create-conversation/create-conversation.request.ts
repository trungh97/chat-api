export type CreateConversationRequest = {
  title?: string;
  lastMessageAt?: Date;
  participants: string[];
};
