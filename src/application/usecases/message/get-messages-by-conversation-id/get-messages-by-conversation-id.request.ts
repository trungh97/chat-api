export type GetMessagesByConversationIdRequest = {
  conversationId: string;
  cursor?: string;
  limit?: number;
};
