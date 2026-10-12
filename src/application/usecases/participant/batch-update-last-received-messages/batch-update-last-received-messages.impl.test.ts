import { IDetailedMessageRepositoryDTO } from "@domain/dtos";
import { Participant } from "@domain/entities";
import { IMessageEventPublisher } from "@domain/events";
import {
  IMessageRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { ILogger } from "@shared/logger";
import { BatchUpdateLastReceivedMessagesUseCase } from "./batch-update-last-received-messages.impl";

describe("BatchUpdateLastReceivedMessagesUseCase", () => {
  const createdAt = {
    m1: new Date("2026-10-01T10:00:00.000Z"),
    m2: new Date("2026-10-01T11:00:00.000Z"),
    m3: new Date("2026-10-01T12:00:00.000Z"),
  };
  // u1 is a participant of c1 (p1) and c2 (p2), but not of c3.
  const ownParticipants: Record<string, Participant> = {
    c1: { id: "p1", userId: "u1" } as Participant,
    c2: { id: "p2", userId: "u1" } as Participant,
  };
  const messages: Record<string, IDetailedMessageRepositoryDTO> = {
    m1: { id: "m1", conversationId: "c1", createdAt: createdAt.m1 },
    m2: { id: "m2", conversationId: "c2", createdAt: createdAt.m2 },
    m3: { id: "m3", conversationId: "c3", createdAt: createdAt.m3 },
  } as unknown as Record<string, IDetailedMessageRepositoryDTO>;

  let participantRepository: jest.Mocked<IParticipantRepository>;
  let messageRepository: jest.Mocked<IMessageRepository>;
  let messagePublisher: jest.Mocked<IMessageEventPublisher>;
  let logger: jest.Mocked<ILogger>;
  let useCase: BatchUpdateLastReceivedMessagesUseCase;

  beforeEach(() => {
    participantRepository = {
      getParticipantById: jest.fn(async (conversationId: string) =>
        ownParticipants[conversationId]
          ? { value: ownParticipants[conversationId] }
          : { value: null, error: new Error("Participant not found") }
      ),
      getParticipantsByConversationId: jest.fn(
        async (conversationId: string) => ({
          value: [
            { id: `${conversationId}-other`, userId: "u9" },
            ownParticipants[conversationId],
          ] as Participant[],
        })
      ),
      batchUpdateLastReceivedMessages: jest
        .fn()
        .mockResolvedValue({ value: ["p1", "p2"] }),
    } as unknown as jest.Mocked<IParticipantRepository>;
    messageRepository = {
      getMessageById: jest.fn(async (id: string) => ({ value: messages[id] })),
    } as unknown as jest.Mocked<IMessageRepository>;
    messagePublisher = {
      publishLastReceivedMessageUpdated: jest.fn(),
    } as unknown as jest.Mocked<IMessageEventPublisher>;
    logger = { error: jest.fn() } as unknown as jest.Mocked<ILogger>;

    useCase = new BatchUpdateLastReceivedMessagesUseCase(
      participantRepository,
      messageRepository,
      messagePublisher,
      logger
    );
  });

  it("only updates the acting user's own participants and skips other conversations", async () => {
    const result = await useCase.execute({
      userId: "u1",
      items: [
        { conversationId: "c1", messageId: "m1" },
        { conversationId: "c2", messageId: "m2" },
        { conversationId: "c3", messageId: "m3" },
      ],
    });

    expect(result).toEqual({ data: true });
    expect(
      participantRepository.batchUpdateLastReceivedMessages
    ).toHaveBeenCalledWith([
      { participantId: "p1", messageId: "m1", messageCreatedAt: createdAt.m1 },
      { participantId: "p2", messageId: "m2", messageCreatedAt: createdAt.m2 },
    ]);
  });

  it("skips a message that belongs to a different conversation", async () => {
    await useCase.execute({
      userId: "u1",
      items: [{ conversationId: "c1", messageId: "m2" }],
    });

    expect(
      participantRepository.batchUpdateLastReceivedMessages
    ).toHaveBeenCalledWith([]);
  });

  it("publishes one event per conversation, only for pointers that moved", async () => {
    participantRepository.batchUpdateLastReceivedMessages.mockResolvedValue({
      value: ["p2"],
    });

    await useCase.execute({
      userId: "u1",
      items: [
        { conversationId: "c1", messageId: "m1" },
        { conversationId: "c2", messageId: "m2" },
      ],
    });

    expect(
      messagePublisher.publishLastReceivedMessageUpdated
    ).toHaveBeenCalledTimes(1);
    expect(
      messagePublisher.publishLastReceivedMessageUpdated
    ).toHaveBeenCalledWith({
      recipientUserIds: ["u9", "u1"],
      updates: [
        {
          conversationId: "c2",
          participantId: "p2",
          messageId: "m2",
          messageCreatedAt: createdAt.m2,
        },
      ],
    });
  });

  it("returns the repository error", async () => {
    participantRepository.batchUpdateLastReceivedMessages.mockResolvedValue({
      value: null,
      error: new Error("db down"),
    });

    const result = await useCase.execute({
      userId: "u1",
      items: [{ conversationId: "c1", messageId: "m1" }],
    });

    expect(result).toEqual({ data: null, error: "db down" });
    expect(
      messagePublisher.publishLastReceivedMessageUpdated
    ).not.toHaveBeenCalled();
  });
});
