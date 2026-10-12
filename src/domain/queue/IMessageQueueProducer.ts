import { MessageStatus } from "@domain/enums";

export type EnqueueMessageSeenUpdateRequest = {
  userId: string;
  conversationId: string;
  messageId: string;
};

export interface IMessageQueueProducer {
  /**
   * Enqueues an update of the acting user's last seen message in a conversation.
   *
   * @param request - The acting user (from the session), the conversation and the seen message.
   * @returns A promise resolving to void.
   */
  enqueueMessageSeenUpdate(
    request: EnqueueMessageSeenUpdateRequest
  ): Promise<void>;
  enqueueMessageStatusUpdate(
    messageId: string,
    status: keyof typeof MessageStatus,
    currentUserId: string
  ): Promise<void>;
}
