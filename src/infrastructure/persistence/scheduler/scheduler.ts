import { scheduleDeleteExpiredFriendRequests } from "./friendRequestScheduler";

export function setupAllSchedulers() {
  scheduleDeleteExpiredFriendRequests();
}
