import "reflect-metadata";
import { Context } from "types";
import { UserResolver } from "./UserResolver";

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
