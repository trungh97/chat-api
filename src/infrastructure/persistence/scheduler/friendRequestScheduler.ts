import { IDeleteExpiredFriendRequestsUseCase } from "@application/usecases/friend-request";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import cron from "node-cron";

const deletedExpiredFriendRequestUseCase =
  container.get<IDeleteExpiredFriendRequestsUseCase>(
    TYPES.DeleteExpiredFriendRequestsUseCase
  );

export function scheduleDeleteExpiredFriendRequests() {
  cron.schedule("0 0 * * *", async () => {
    console.log(
      "[Scheduler] Running job to clean up expired friend requests..."
    );
    await deletedExpiredFriendRequestUseCase.execute(1);
  });
}
