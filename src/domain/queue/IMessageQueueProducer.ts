import { ICreateMessageRequestDTO } from "@domain/dtos";
import { MessageStatus } from "@domain/enums";

export type EnqueuePersistMessageRequest = ICreateMessageRequestDTO & {
  currentUserId: string;
};

export interface IMessageQueueProducer {
  enqueuePersistMessage(message: EnqueuePersistMessageRequest): Promise<void>;
  enqueueMessageStatusUpdate(
    messageId: string,
    status: keyof typeof MessageStatus,
    currentUserId: string
  ): Promise<void>;
}
