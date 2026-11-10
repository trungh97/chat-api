import "reflect-metadata";
import { IMessageEventPublisher } from "@domain/events";
import { ILogger } from "@shared/logger";
import { RedisClientType } from "redis";
import { HeartbeatUserPresenseUseCase } from "./heartbeat-user-presense.impl";

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe("HeartbeatUserPresenseUseCase", () => {
  const redisClient = {
    exists: jest.fn(),
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
    redisClient.exists.mockResolvedValue(1);
  });

  it("publishes an offline event with lastSeenAt when the key could not be refreshed", async () => {
    redisClient.expire.mockResolvedValue(0);
    const before = Date.now();

    await expect(useCase.execute({ userId: "u1" })).resolves.toEqual({
      data: true,
    });
    await flushPromises();

    expect(publisher.publishPresenseUpdate).toHaveBeenCalledTimes(1);
    const [payload] = publisher.publishPresenseUpdate.mock.calls[0];
    expect(payload).toMatchObject({ userId: "u1", isOnline: false });
    expect(payload.lastSeenAt).toBeInstanceOf(Date);
    expect(payload.lastSeenAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("publishes nothing when the key is refreshed", async () => {
    redisClient.expire.mockResolvedValue(1);

    await useCase.execute({ userId: "u1" });
    await flushPromises();

    expect(publisher.publishPresenseUpdate).not.toHaveBeenCalled();
  });
});
