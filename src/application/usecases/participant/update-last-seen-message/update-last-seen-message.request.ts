export type UpdateParticipantLastSeenMessageRequest = {
  /** The acting user, taken from the session. */
  userId: string;
  conversationId: string;
  messageId: string;
};
