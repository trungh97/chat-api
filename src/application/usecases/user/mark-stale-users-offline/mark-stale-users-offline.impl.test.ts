import "reflect-metadata";
import { IUserPresenceStore } from "@domain/cache";
import { IMessageEventPublisher } from "@domain/events";
import { ILogger } from "@shared/logger";
import { MarkStaleUsersOfflineUseCase } from "./mark-stale-users-offline.impl";

describe("MarkStaleUsersOfflineUseCase", () => {
  const NOW = new Date("2026-11-14T10:00:00.000Z");
  const secondsAgo = (seconds: number) =>
    new Date(NOW.getTime() - seconds * 1_000);

  const store = { findOnlineUsers: jest.fn(), markOffline: jest.fn() };
  const publisher = { publishPresenseUpdate: jest.fn() };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const useCase = new MarkStaleUsersOfflineUseCase(
    store as unknown as IUserPresenceStore,
    publisher as unknown as IMessageEventPublisher,
    logger as unknown as ILogger
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("marks a stale user offline and publishes their last heartbeat time", async () => {
    const lastSeenAt = secondsAgo(91);
    store.findOnlineUsers.mockResolvedValue([{ userId: "u1", lastSeenAt }]);

    await expect(useCase.execute({ thresholdSeconds: 90 })).resolves.toEqual({
      data: 1,
    });

    expect(store.markOffline).toHaveBeenCalledWith("u1");
    expect(publisher.publishPresenseUpdate).toHaveBeenCalledTimes(1);
    expect(publisher.publishPresenseUpdate).toHaveBeenCalledWith({
      userId: "u1",
      isOnline: false,
      lastSeenAt,
    });
  });

  it("leaves a user alone whose heartbeat is within the threshold", async () => {
    store.findOnlineUsers.mockResolvedValue([
      { userId: "fresh", lastSeenAt: secondsAgo(30) },
      { userId: "on-the-line", lastSeenAt: secondsAgo(90) },
    ]);

    await expect(useCase.execute({ thresholdSeconds: 90 })).resolves.toEqual({
      data: 0,
    });

    expect(store.markOffline).not.toHaveBeenCalled();
    expect(publisher.publishPresenseUpdate).not.toHaveBeenCalled();
  });

  it("only touches the stale users in a mixed list", async () => {
    store.findOnlineUsers.mockResolvedValue([
      { userId: "fresh", lastSeenAt: secondsAgo(10) },
      { userId: "stale", lastSeenAt: secondsAgo(200) },
    ]);

    await expect(useCase.execute({ thresholdSeconds: 90 })).resolves.toEqual({
      data: 1,
    });

    expect(store.markOffline.mock.calls).toEqual([["stale"]]);
  });

  it("treats a record with no readable time as stale and publishes the current time", async () => {
    store.findOnlineUsers.mockResolvedValue([
      { userId: "u1", lastSeenAt: null },
    ]);

    await useCase.execute({ thresholdSeconds: 90 });

    expect(store.markOffline).toHaveBeenCalledWith("u1");
    expect(publisher.publishPresenseUpdate).toHaveBeenCalledWith({
      userId: "u1",
      isOnline: false,
      lastSeenAt: NOW,
    });
  });

  it("does nothing when nobody is online", async () => {
    store.findOnlineUsers.mockResolvedValue([]);

    await expect(useCase.execute({ thresholdSeconds: 90 })).resolves.toEqual({
      data: 0,
    });

    expect(store.markOffline).not.toHaveBeenCalled();
    expect(publisher.publishPresenseUpdate).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it("stops at the first failure and leaves the remaining users for the next run", async () => {
    store.findOnlineUsers.mockResolvedValue([
      { userId: "first", lastSeenAt: secondsAgo(200) },
      { userId: "second", lastSeenAt: secondsAgo(200) },
      { userId: "third", lastSeenAt: secondsAgo(200) },
    ]);
    store.markOffline
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("redis down"));

    await expect(useCase.execute({ thresholdSeconds: 90 })).resolves.toEqual({
      data: null,
      error: "redis down",
    });

    expect(store.markOffline.mock.calls).toEqual([["first"], ["second"]]);
    expect(publisher.publishPresenseUpdate).toHaveBeenCalledTimes(1);
    expect(publisher.publishPresenseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "first", isOnline: false })
    );
  });

  it("returns the error instead of throwing when the store fails", async () => {
    store.findOnlineUsers.mockRejectedValue(new Error("redis down"));

    await expect(useCase.execute({ thresholdSeconds: 90 })).resolves.toEqual({
      data: null,
      error: "redis down",
    });

    expect(logger.error).toHaveBeenCalledWith(
      "Error marking stale users offline: redis down"
    );
    expect(publisher.publishPresenseUpdate).not.toHaveBeenCalled();
  });
});
