export type BatchUpdateLastReceivedMessagesRequest = {
  /** The acting user, taken from the session. */
  userId: string;
  items: {
    conversationId: string;
    messageId: string;
  }[];
};
