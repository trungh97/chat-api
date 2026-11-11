import "reflect-metadata";
import { IMessageEventPublisher } from "@domain/events";
import { RedisClientType } from "redis";
import { UpdateUserPresenseUseCase } from "./update-user-presense.impl";

describe("UpdateUserPresenseUseCase", () => {
  const redisClient = {
    exists: jest.fn(),
    hSet: jest.fn(),
    expire: jest.fn(),
  };
  const publisher = { publishPresenseUpdate: jest.fn() };
  const useCase = new UpdateUserPresenseUseCase(
    redisClient as unknown as RedisClientType,
    publisher as unknown as IMessageEventPublisher
  );

  beforeEach(() => {
    jest.clearAllMocks();
    redisClient.exists.mockResolvedValue(1);
  });

  it("publishes the change with the same lastSeenAt it stores", async () => {
    const lastSeenAt = "2026-11-10T10:00:00.000Z";

    const result = await useCase.execute({
      userId: "u1",
      isOnline: false,
      lastSeenAt,
    });

    expect(result).toEqual({ data: true });
    expect(redisClient.hSet).toHaveBeenCalledWith("user-presence:u1", {
      isOnline: "false",
      lastSeenAt,
    });
    expect(publisher.publishPresenseUpdate).toHaveBeenCalledWith({
      userId: "u1",
      isOnline: false,
      lastSeenAt: new Date(lastSeenAt),
    });
  });

  it("uses the current time as lastSeenAt when none is given", async () => {
    const before = Date.now();

    await useCase.execute({ userId: "u1", isOnline: true });

    const [{ lastSeenAt }] = publisher.publishPresenseUpdate.mock.calls[0];
    expect(lastSeenAt).toBeInstanceOf(Date);
    expect(lastSeenAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});
