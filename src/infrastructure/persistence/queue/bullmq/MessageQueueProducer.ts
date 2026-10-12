import { MessageStatus } from "@domain/enums";
import {
  EnqueueMessageSeenUpdateRequest,
  IMessageQueueProducer,
} from "@domain/queue";
import { Queue } from "bullmq";
import { injectable } from "inversify";
import { bullConnection } from "./connection";

@injectable()
export class MessageQueueProducer implements IMessageQueueProducer {
  private readonly queue = new Queue("message-queue", {
    connection: bullConnection,
  });

  async enqueueMessageSeenUpdate(
    request: EnqueueMessageSeenUpdateRequest
  ): Promise<void> {
    await this.queue.add("message-seen-update", request, {
      removeOnComplete: true,
    });
  }

  async enqueueMessageStatusUpdate(
    messageId: string,
    status: keyof typeof MessageStatus,
    currentUserId: string
  ): Promise<void> {
    await this.queue.add(
      "message-status-update",
      { messageId, status, currentUserId },
      { removeOnComplete: true }
    );
  }

  async enqueueFindAndBatchUpdateLastReceivedMessages(
    userId: string
  ): Promise<void> {
    await this.queue.add(
      "batch-update-last-received-message",
      { userId },
      { removeOnComplete: true }
    );
  }
}
