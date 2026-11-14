import {
  PRESENCE_CLEANUP_INTERVAL_SECONDS,
  PRESENCE_HEARTBEAT_INTERVAL_SECONDS,
  PRESENCE_OFFLINE_THRESHOLD_SECONDS,
  PRESENCE_TTL_SECONDS,
} from "./cache";

describe("presence timing constants", () => {
  it("keeps a user who heartbeats on time under the offline threshold", () => {
    expect(PRESENCE_HEARTBEAT_INTERVAL_SECONDS).toBeLessThan(
      PRESENCE_OFFLINE_THRESHOLD_SECONDS
    );
  });

  it("lets the cleanup job see a stale key before it expires", () => {
    expect(
      PRESENCE_OFFLINE_THRESHOLD_SECONDS + PRESENCE_CLEANUP_INTERVAL_SECONDS
    ).toBeLessThan(PRESENCE_TTL_SECONDS);
  });

  it("uses a cleanup interval the job's cron expression can run evenly", () => {
    expect(60 % PRESENCE_CLEANUP_INTERVAL_SECONDS).toBe(0);
  });
});
