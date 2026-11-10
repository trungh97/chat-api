import "reflect-metadata";
import { Context } from "types";
import { UserResolver } from "../../UserResolver";

const updateUserPresence = { execute: jest.fn() };
const heartbeatUserPresence = { execute: jest.fn() };

jest.mock("@infrastructure/external/di/inversify/inversify.config", () => ({
  container: {
    get: (type: symbol) => {
      // Resolved lazily so the mocks above exist when the resolver is built.
      const { TYPES: types } = jest.requireActual(
        "@infrastructure/external/di/inversify/types"
      );
      if (type === types.UpdateUserPresenseUseCase) return updateUserPresence;
      if (type === types.HeartbeatUserPresenseUseCase)
        return heartbeatUserPresence;
      if (type === types.WinstonLogger) return { error: jest.fn() };
      return {};
    },
  },
}));

jest.mock("@infrastructure/persistence/websocket/redis-pubsub", () => ({
  Topic: { PRESENSE_UPDATE: "PRESENSE_UPDATE" },
}));

const contextFor = (userId: string) =>
  ({ req: { session: { userId } }, res: {} }) as unknown as Context;

describe("UserResolver presence mutations", () => {
  let resolver: UserResolver;

  beforeEach(() => {
    // The constructor ignores its parameters and resolves everything from the container.
    resolver = new (UserResolver as unknown as new () => UserResolver)();
  });

  it("updateUserPresence uses the session user, not the argument", async () => {
    updateUserPresence.execute.mockResolvedValue({ data: true });

    await resolver.updateUserPresence("someone-else", true, contextFor("me"));

    expect(updateUserPresence.execute).toHaveBeenCalledWith({
      userId: "me",
      isOnline: true,
    });
  });

  it("heartbeatUserPresence uses the session user, not the argument", async () => {
    heartbeatUserPresence.execute.mockResolvedValue({ data: true });

    await resolver.heartbeatUserPresence("someone-else", contextFor("me"));

    expect(heartbeatUserPresence.execute).toHaveBeenCalledWith({
      userId: "me",
    });
  });
});

describe("UserResolver userPresence subscription", () => {
  it("wraps the raw presence event in the response shape", () => {
    const resolver = new (UserResolver as unknown as new () => UserResolver)();
    // After the Redis round trip the Date arrives as an ISO string.
    const payload = {
      userId: "u1",
      isOnline: true,
      lastSeenAt: "2026-11-10T10:00:00.000Z" as unknown as Date,
    };

    const response = resolver.userPresence(payload);

    expect(response.statusCode).toBe(200);
    expect(response.error).toBeUndefined();
    expect(response.data).toEqual({
      userId: "u1",
      isOnline: true,
      lastSeenAt: new Date("2026-11-10T10:00:00.000Z"),
    });
    expect(response.data?.lastSeenAt).toBeInstanceOf(Date);
  });
});
