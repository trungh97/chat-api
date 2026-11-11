import { Conversation } from "@domain/entities";
import { IConversationRepository } from "@domain/repositories";
import { ILogger } from "@shared/logger";
import { ConversationUseCaseResponse } from "../types";
import { IFindConversationByIdUseCase } from "../find-conversation-by-id";
import { GetDirectConversationUseCase } from "./get-direct-conversation.impl";

describe("GetDirectConversationUseCase", () => {
  let conversationRepository: jest.Mocked<
    Pick<IConversationRepository, "findPrivateBetween">
  >;
  let findConversationById: jest.Mocked<IFindConversationByIdUseCase>;
  let useCase: GetDirectConversationUseCase;

  beforeEach(() => {
    conversationRepository = {
      findPrivateBetween: jest.fn().mockResolvedValue({ value: null }),
    };
    findConversationById = { execute: jest.fn() };
    useCase = new GetDirectConversationUseCase(
      conversationRepository as unknown as IConversationRepository,
      findConversationById,
      { error: jest.fn() } as unknown as ILogger
    );
  });

  it("returns null when the users have no direct conversation yet", async () => {
    const result = await useCase.execute({ userId: "me", otherUserId: "u2" });

    expect(conversationRepository.findPrivateBetween).toHaveBeenCalledWith(
      "me",
      "u2"
    );
    expect(result).toEqual({ data: null });
    expect(findConversationById.execute).not.toHaveBeenCalled();
  });

  it("returns the direct conversation as the caller sees it", async () => {
    const detail = {
      conversation: { id: "dm1", title: "Ann Tester" },
    } as ConversationUseCaseResponse;
    conversationRepository.findPrivateBetween.mockResolvedValue({
      value: { id: "dm1" } as Conversation,
    });
    findConversationById.execute.mockResolvedValue({ data: detail });

    const result = await useCase.execute({ userId: "me", otherUserId: "u2" });

    expect(findConversationById.execute).toHaveBeenCalledWith({
      id: "dm1",
      userId: "me",
    });
    expect(result).toEqual({ data: detail });
  });

  it("returns null for yourself without querying", async () => {
    const result = await useCase.execute({ userId: "me", otherUserId: "me" });

    expect(result).toEqual({ data: null });
    expect(conversationRepository.findPrivateBetween).not.toHaveBeenCalled();
  });

  it("returns the repository error", async () => {
    conversationRepository.findPrivateBetween.mockResolvedValue({
      value: null,
      error: new Error("db down"),
    });

    const result = await useCase.execute({ userId: "me", otherUserId: "u2" });

    expect(result).toEqual({ data: null, error: "db down" });
  });
});
