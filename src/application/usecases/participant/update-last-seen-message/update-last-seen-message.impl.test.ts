import { IDetailedMessageRepositoryDTO } from "@domain/dtos";
import { Participant } from "@domain/entities";
import { IMessageEventPublisher } from "@domain/events";
import {
  IMessageRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { ILogger } from "@shared/logger";
import { UpdateParticipantLastSeenMessageUseCase } from "./update-last-seen-message.impl";

describe("UpdateParticipantLastSeenMessageUseCase", () => {
  const messageCreatedAt = new Date("2026-10-01T10:00:00.000Z");
  const request = { userId: "u1", conversationId: "c1", messageId: "m1" };

  let participantRepository: jest.Mocked<IParticipantRepository>;
  let messageRepository: jest.Mocked<IMessageRepository>;
  let messagePublisher: jest.Mocked<IMessageEventPublisher>;
  let logger: jest.Mocked<ILogger>;
  let useCase: UpdateParticipantLastSeenMessageUseCase;

  beforeEach(() => {
    participantRepository = {
      getParticipantById: jest.fn().mockResolvedValue({
        value: { id: "p1", userId: "u1" } as Participant,
      }),
      getParticipantsByConversationId: jest.fn().mockResolvedValue({
        value: [
          { id: "p1", userId: "u1" },
          { id: "p2", userId: "u2" },
        ] as Participant[],
      }),
      updateLastSeenMessage: jest.fn().mockResolvedValue({ value: true }),
    } as unknown as jest.Mocked<IParticipantRepository>;
    messageRepository = {
      getMessageById: jest.fn().mockResolvedValue({
        value: {
          id: "m1",
          conversationId: "c1",
          createdAt: messageCreatedAt,
        } as IDetailedMessageRepositoryDTO,
      }),
    } as unknown as jest.Mocked<IMessageRepository>;
    messagePublisher = {
      publishLastSeenMessageUpdated: jest.fn(),
    } as unknown as jest.Mocked<IMessageEventPublisher>;
    logger = { error: jest.fn() } as unknown as jest.Mocked<ILogger>;

    useCase = new UpdateParticipantLastSeenMessageUseCase(
      participantRepository,
      messageRepository,
      messagePublisher,
      logger
    );
  });

  it("moves the acting user's own pointer and publishes to the conversation's participants", async () => {
    const result = await useCase.execute(request);

    expect(result).toEqual({ data: true });
    expect(participantRepository.getParticipantById).toHaveBeenCalledWith(
      "c1",
      "u1"
    );
    expect(participantRepository.updateLastSeenMessage).toHaveBeenCalledWith({
      participantId: "p1",
      messageId: "m1",
      messageCreatedAt,
    });
    expect(messagePublisher.publishLastSeenMessageUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "c1",
        participantId: "p1",
        messageId: "m1",
        messageCreatedAt,
        recipientUserIds: ["u1", "u2"],
      })
    );
  });

  it("rejects a user who is not a participant of the conversation", async () => {
    participantRepository.getParticipantById.mockResolvedValue({
      value: null,
      error: new Error("Participant not found"),
    });

    const result = await useCase.execute(request);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/not a participant/);
    expect(participantRepository.updateLastSeenMessage).not.toHaveBeenCalled();
    expect(messagePublisher.publishLastSeenMessageUpdated).not.toHaveBeenCalled();
  });

  it("rejects a message from another conversation", async () => {
    messageRepository.getMessageById.mockResolvedValue({
      value: {
        id: "m1",
        conversationId: "other",
        createdAt: messageCreatedAt,
      } as IDetailedMessageRepositoryDTO,
    });

    const result = await useCase.execute(request);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/does not exist in the conversation/);
    expect(participantRepository.updateLastSeenMessage).not.toHaveBeenCalled();
  });

  it("rejects a message that does not exist", async () => {
    messageRepository.getMessageById.mockResolvedValue({
      value: null,
      error: new Error("not found"),
    });

    const result = await useCase.execute(request);

    expect(result.data).toBeNull();
    expect(participantRepository.updateLastSeenMessage).not.toHaveBeenCalled();
  });

  it("does not publish when the user had already seen a later message", async () => {
    participantRepository.updateLastSeenMessage.mockResolvedValue({
      value: false,
    });

    const result = await useCase.execute(request);

    expect(result).toEqual({ data: false });
    expect(messagePublisher.publishLastSeenMessageUpdated).not.toHaveBeenCalled();
  });

  it("returns the repository error", async () => {
    participantRepository.updateLastSeenMessage.mockResolvedValue({
      value: null,
      error: new Error("db down"),
    });

    const result = await useCase.execute(request);

    expect(result).toEqual({ data: null, error: "db down" });
    expect(messagePublisher.publishLastSeenMessageUpdated).not.toHaveBeenCalled();
  });
});
