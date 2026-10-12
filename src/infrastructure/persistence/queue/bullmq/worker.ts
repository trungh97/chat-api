import { Worker } from "bullmq";
import { bullConnection } from "./connection";

export const messageWorker = new Worker(
  "messages",
  async (job) => {
    console.log(`Processing job: ${job.id}`, job.data);
    // TODO: update DB status here
  },
  { connection: bullConnection, removeOnComplete: { count: 0 } }
);

messageWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

messageWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
