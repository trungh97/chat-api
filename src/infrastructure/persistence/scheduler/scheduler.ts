import { scheduleCleanUpPresence } from "./cleanUpPresenceUserScheduler";
import { scheduleDeleteExpiredFriendRequests } from "./friendRequestScheduler";

export function setupAllSchedulers() {
  scheduleDeleteExpiredFriendRequests();
  scheduleCleanUpPresence();
}
