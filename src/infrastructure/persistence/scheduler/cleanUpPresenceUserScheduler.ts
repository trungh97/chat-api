import { IMarkStaleUsersOfflineUseCase } from "@application/usecases/user";
import { container } from "@infrastructure/external/di/inversify";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import {
  PRESENCE_CLEANUP_INTERVAL_SECONDS,
  PRESENCE_OFFLINE_THRESHOLD_SECONDS,
} from "@shared/constants";
import cron from "node-cron";

const markStaleUsersOfflineUseCase =
  container.get<IMarkStaleUsersOfflineUseCase>(
    TYPES.MarkStaleUsersOfflineUseCase
  );

// node-cron starts a run on every tick, even while the previous one is still waiting on Redis.
let isRunning = false;

/**
 * Marks users whose heartbeat stopped as offline. The use case logs what it did and returns
 * its errors instead of throwing, so the job has nothing to handle here.
 */
export function scheduleCleanUpPresence() {
  // Six fields: the first one is seconds. The interval must divide 60 evenly.
  cron.schedule(`*/${PRESENCE_CLEANUP_INTERVAL_SECONDS} * * * * *`, async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await markStaleUsersOfflineUseCase.execute({
        thresholdSeconds: PRESENCE_OFFLINE_THRESHOLD_SECONDS,
      });
    } finally {
      isRunning = false;
    }
  });
}
