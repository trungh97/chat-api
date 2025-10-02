export interface BatchUpdateLastReceivedMessagesRequest {
  updates: { participantId: string; messageId: string }[];
}
