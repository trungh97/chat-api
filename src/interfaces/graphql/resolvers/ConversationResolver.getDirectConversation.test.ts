import "reflect-metadata";
import { StatusCodes } from "http-status-codes";
import { Context } from "types";
import { ConversationResolver } from "./ConversationResolver";

const getDirectConversation = { execute: jest.fn() };

jest.mock("@infrastructure/external/di/inversify/inversify.config", () => ({
  container: {
    get: (type: symbol) => {
      // Resolved lazily so the mock above exists when the resolver is built.
      const { TYPES: types } = jest.requireActual(
        "@infrastructure/external/di/inversify/types"
      );
      if (type === types.GetDirectConversationUseCase)
        return getDirectConversation;
      if (type === types.WinstonLogger) return { error: jest.fn() };
      return {};
    },
  },
}));

const contextFor = (userId: string) =>
  ({ req: { session: { userId } }, res: {} }) as unknown as Context;

describe("ConversationResolver.getDirectConversation", () => {
  let resolver: ConversationResolver;

  beforeEach(() => {
    getDirectConversation.execute.mockReset();
    // The constructor ignores its parameters and resolves everything from the container.
    resolver = new (ConversationResolver as unknown as new () => ConversationResolver)();
  });

  it("looks up the session user's conversation with the other user", async () => {
    const conversation = { id: "dm1", title: "Ann Tester" };
    getDirectConversation.execute.mockResolvedValue({
      data: { conversation, participants: [], messages: [] },
    });

    const result = await resolver.getDirectConversation("u2", contextFor("me"));

    expect(getDirectConversation.execute).toHaveBeenCalledWith({
      userId: "me",
      otherUserId: "u2",
    });
    expect(result.statusCode).toBe(StatusCodes.OK);
    expect(result.data).toEqual({
      ...conversation,
      participants: [],
      messages: [],
    });
  });

  it("returns null data when there is no direct conversation yet", async () => {
    getDirectConversation.execute.mockResolvedValue({ data: null });

    const result = await resolver.getDirectConversation("u2", contextFor("me"));

    expect(result.statusCode).toBe(StatusCodes.OK);
    expect(result.data).toBeNull();
  });

  it("returns BAD_REQUEST with the use-case error", async () => {
    getDirectConversation.execute.mockResolvedValue({
      data: null,
      error: "db down",
    });

    const result = await resolver.getDirectConversation("u2", contextFor("me"));

    expect(result).toEqual({
      statusCode: StatusCodes.BAD_REQUEST,
      error: "db down",
    });
  });

  it("returns INTERNAL_SERVER_ERROR when the use case throws", async () => {
    getDirectConversation.execute.mockRejectedValue(new Error("boom"));

    const result = await resolver.getDirectConversation("u2", contextFor("me"));

    expect(result).toEqual({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "boom",
    });
  });
});
