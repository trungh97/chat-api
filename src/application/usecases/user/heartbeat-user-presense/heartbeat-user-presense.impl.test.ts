import "reflect-metadata";
import { IMessageEventPublisher } from "@domain/events";
import { PRESENCE_TTL_SECONDS } from "@shared/constants";
import { ILogger } from "@shared/logger";
import { RedisClientType } from "redis";
import { HeartbeatUserPresenseUseCase } from "./heartbeat-user-presense.impl";

describe("HeartbeatUserPresenseUseCase", () => {
  const redisClient = {
    hGet: jest.fn(),
    hSet: jest.fn(),
    expire: jest.fn(),
  };
  const logger = { error: jest.fn() };
  const publisher = { publishPresenseUpdate: jest.fn() };
  const useCase = new HeartbeatUserPresenseUseCase(
    redisClient as unknown as RedisClientType,
    logger as unknown as ILogger,
    publisher as unknown as IMessageEventPublisher
  );

  beforeEach(() => {
    jest.clearAllMocks();
    redisClient.expire.mockResolvedValue(true);
  });

  it("only refreshes lastSeenAt for a user who is already online", async () => {
    redisClient.hGet.mockResolvedValue("true");

    await expect(useCase.execute({ userId: "u1" })).resolves.toEqual({
      data: true,
    });

    expect(redisClient.hGet).toHaveBeenCalledWith(
      "user-presence:u1",
      "isOnline"
    );
    expect(redisClient.hSet).toHaveBeenCalledWith("user-presence:u1", {
      lastSeenAt: expect.any(String),
    });
    expect(publisher.publishPresenseUpdate).not.toHaveBeenCalled();
  });

  it.each([
    ["was marked offline", "false"],
    ["has no presence key", undefined],
  ])(
    "sets the user online and publishes an online event when the user %s",
    async (_case, storedIsOnline) => {
      redisClient.hGet.mockResolvedValue(storedIsOnline);
      const before = Date.now();

      await expect(useCase.execute({ userId: "u1" })).resolves.toEqual({
        data: true,
      });

      const [key, fields] = redisClient.hSet.mock.calls[0];
      expect(key).toBe("user-presence:u1");
      expect(fields).toMatchObject({ userId: "u1", isOnline: "true" });
      expect(redisClient.expire).toHaveBeenCalledWith(
        "user-presence:u1",
        PRESENCE_TTL_SECONDS
      );

      expect(publisher.publishPresenseUpdate).toHaveBeenCalledTimes(1);
      const [payload] = publisher.publishPresenseUpdate.mock.calls[0];
      expect(payload).toMatchObject({ userId: "u1", isOnline: true });
      expect(payload.lastSeenAt).toBeInstanceOf(Date);
      expect(payload.lastSeenAt.getTime()).toBeGreaterThanOrEqual(before);
      // The event carries the same time that was stored.
      expect(payload.lastSeenAt.toISOString()).toBe(fields.lastSeenAt);
    }
  );

  it("refreshes the key's TTL on every heartbeat", async () => {
    redisClient.hGet.mockResolvedValue("true");

    await useCase.execute({ userId: "u1" });

    expect(redisClient.expire).toHaveBeenCalledWith(
      "user-presence:u1",
      PRESENCE_TTL_SECONDS
    );
  });

  it("returns the error when the online event cannot be published", async () => {
    redisClient.hGet.mockResolvedValue("false");
    publisher.publishPresenseUpdate.mockRejectedValueOnce(
      new Error("publish failed")
    );

    await expect(useCase.execute({ userId: "u1" })).resolves.toEqual({
      data: null,
      error: "publish failed",
    });
  });

  it("returns the error instead of throwing when Redis fails", async () => {
    redisClient.hGet.mockRejectedValue(new Error("redis down"));

    await expect(useCase.execute({ userId: "u1" })).resolves.toEqual({
      data: null,
      error: "redis down",
    });

    expect(logger.error).toHaveBeenCalledWith("redis down");
    expect(publisher.publishPresenseUpdate).not.toHaveBeenCalled();
  });
});
