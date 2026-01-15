import { UpdateMessageStatusUseCase } from "@application/usecases/message";
import { TYPES } from "@infrastructure/external/di/inversify";
import { Job, Worker } from "bullmq";
import { inject } from "inversify";
import { bullConnection } from "./connection";

export class MessageQueueWorker {
  constructor(
    @inject(TYPES.UpdateMessageStatusUseCase)
    private updateMessageStatusUseCase: UpdateMessageStatusUseCase
  ) {
    new Worker(
      "message-queue",
      async (job: Job) => {
        if (job.name === "message-status-update") {
          const { messageId, status } = job.data;
          await this.updateMessageStatusUseCase.execute({
            id: messageId,
            status,
          });
        }
      },
      { connection: bullConnection, removeOnComplete: { count: 0 } }
    );
  }
}
