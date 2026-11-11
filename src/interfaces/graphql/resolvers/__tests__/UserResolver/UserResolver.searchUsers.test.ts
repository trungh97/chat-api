import "reflect-metadata";
import { StatusCodes } from "http-status-codes";
import { Context } from "types";
import { UserResolver } from "../../UserResolver";

const searchUsers = { execute: jest.fn() };

jest.mock("@infrastructure/external/di/inversify/inversify.config", () => ({
  container: {
    get: (type: symbol) => {
      // Resolved lazily so the mock above exists when the resolver is built.
      const { TYPES: types } = jest.requireActual(
        "@infrastructure/external/di/inversify/types"
      );
      if (type === types.SearchUsersUseCase) return searchUsers;
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

describe("UserResolver.searchUsers", () => {
  let resolver: UserResolver;

  beforeEach(() => {
    searchUsers.execute.mockReset();
    // The constructor ignores its parameters and resolves everything from the container.
    resolver = new (UserResolver as unknown as new () => UserResolver)();
  });

  it("searches as the session user and returns the page", async () => {
    const contact = {
      id: "u1",
      email: "u1@example.com",
      firstName: "Ann",
      lastName: "Tester",
      avatar: null,
      isOnline: true,
    };
    searchUsers.execute.mockResolvedValue({
      data: { data: [contact], nextCursor: "u1" },
    });

    const result = await resolver.searchUsers(
      "ann",
      { limit: 10, cursor: "u0" },
      contextFor("me")
    );

    expect(searchUsers.execute).toHaveBeenCalledWith({
      userId: "me",
      search: "ann",
      pagination: { limit: 10, cursor: "u0" },
    });
    expect(result).toEqual({
      statusCode: StatusCodes.OK,
      message: "Users fetched successfully",
      data: { items: [contact], nextCursor: "u1" },
    });
  });

  it("returns BAD_REQUEST with the use-case error", async () => {
    searchUsers.execute.mockResolvedValue({
      data: null,
      error: "Failed to search users.",
    });

    const result = await resolver.searchUsers(
      undefined,
      { limit: 10 },
      contextFor("me")
    );

    expect(result).toEqual({
      statusCode: StatusCodes.BAD_REQUEST,
      error: "Failed to search users.",
    });
  });

  it("returns INTERNAL_SERVER_ERROR when the use case throws", async () => {
    searchUsers.execute.mockRejectedValue(new Error("boom"));

    const result = await resolver.searchUsers(
      undefined,
      { limit: 10 },
      contextFor("me")
    );

    expect(result).toEqual({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "boom",
    });
  });
});
