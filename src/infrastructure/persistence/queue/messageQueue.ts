import { Queue } from "bullmq";
import { bullConnection } from "./connection";

export const messageQueue = new Queue("messages", {
  connection: bullConnection,
});
