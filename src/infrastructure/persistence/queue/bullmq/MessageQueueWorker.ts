import {
  FindAndBatchUpdateLastReceivedMessageUseCase,
  UpdateParticipantLastSeenMessageUseCase,
} from "@application/usecases/participant";
import { TYPES } from "@infrastructure/external/di/inversify";
import { Job, Worker } from "bullmq";
import { inject, injectable } from "inversify";
import { bullConnection } from "./connection";

@injectable()
export class MessageQueueWorker {
  private worker: Worker;

  constructor(
    @inject(TYPES.UpdateParticipantLastSeenMessageUseCase)
    private updateParticipantLastSeenMessageUseCase: UpdateParticipantLastSeenMessageUseCase,

    @inject(TYPES.FindAndBatchUpdateLastReceivedMessageUseCase)
    private findAndBatchUpdateLastReceivedMessageUseCase: FindAndBatchUpdateLastReceivedMessageUseCase
  ) {
    this.worker = new Worker(
      "message-queue",
      async (job: Job) => {
        if (job.name === "message-seen-update") {
          await this.updateParticipantLastSeenMessageUseCase.execute(job.data);
        }
        if (job.name === "batch-update-last-received-message") {
          await this.findAndBatchUpdateLastReceivedMessageUseCase.execute(
            job.data
          );
        }
      },
      { connection: bullConnection, removeOnComplete: { count: 0 } }
    );

    this.worker.on("failed", (job, err) => {
      console.error("[Worker] Job failed:", job?.name, job?.data, err);
    });
  }
}
