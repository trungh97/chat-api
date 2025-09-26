import { ICreateMessageRequestDTO } from "@domain/dtos";
import { MessageStatus } from "@domain/enums";

export type EnqueuePersistMessageRequest = ICreateMessageRequestDTO & {
  currentUserId: string;
};

export interface IMessageQueueProducer {
  enqueuePersistMessage(message: EnqueuePersistMessageRequest): Promise<void>;
  /**
   * Enqueues a message to update the last seen message ID for a participant in a conversation.
   *
   * @param messageId - The unique identifier of the message that was last seen by the participant.
   * @param participantId - The unique identifier of the participant.
   * @param userId - The unique identifier of the user that requested the message update.
   * @returns A promise resolving to void.
   */
  enqueueMessageSeenUpdate(
    messageId: string,
    participantId: string,
    userId: string
  ): Promise<void>;
  enqueueMessageStatusUpdate(
    messageId: string,
    status: keyof typeof MessageStatus,
    currentUserId: string
  ): Promise<void>;
}
