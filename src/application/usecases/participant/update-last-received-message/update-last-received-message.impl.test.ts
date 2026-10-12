import { IDetailedMessageRepositoryDTO } from "@domain/dtos";
import { Participant } from "@domain/entities";
import { IMessageEventPublisher } from "@domain/events";
import {
  IMessageRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { ILogger } from "@shared/logger";
import { UpdateParticipantLastReceivedMessageUseCase } from "./update-last-received-message.impl";

describe("UpdateParticipantLastReceivedMessageUseCase", () => {
  const messageCreatedAt = new Date("2026-10-01T10:00:00.000Z");
  const request = { userId: "u2", conversationId: "c1", messageId: "m1" };

  let participantRepository: jest.Mocked<IParticipantRepository>;
  let messageRepository: jest.Mocked<IMessageRepository>;
  let messagePublisher: jest.Mocked<IMessageEventPublisher>;
  let logger: jest.Mocked<ILogger>;
  let useCase: UpdateParticipantLastReceivedMessageUseCase;

  beforeEach(() => {
    participantRepository = {
      getParticipantById: jest.fn().mockResolvedValue({
        value: { id: "p2", userId: "u2" } as Participant,
      }),
      getParticipantsByConversationId: jest.fn().mockResolvedValue({
        value: [
          { id: "p1", userId: "u1" },
          { id: "p2", userId: "u2" },
        ] as Participant[],
      }),
      updateLastReceivedMessage: jest.fn().mockResolvedValue({ value: true }),
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
      publishLastReceivedMessageUpdated: jest.fn(),
    } as unknown as jest.Mocked<IMessageEventPublisher>;
    logger = { error: jest.fn() } as unknown as jest.Mocked<ILogger>;

    useCase = new UpdateParticipantLastReceivedMessageUseCase(
      participantRepository,
      messageRepository,
      messagePublisher,
      logger
    );
  });

  it("moves the acting user's own pointer and publishes to the conversation's participants", async () => {
    const result = await useCase.execute(request);

    expect(result).toEqual({ data: true });
    expect(
      participantRepository.updateLastReceivedMessage
    ).toHaveBeenCalledWith({
      participantId: "p2",
      messageId: "m1",
      messageCreatedAt,
    });
    expect(
      messagePublisher.publishLastReceivedMessageUpdated
    ).toHaveBeenCalledWith({
      recipientUserIds: ["u1", "u2"],
      updates: [
        {
          conversationId: "c1",
          participantId: "p2",
          messageId: "m1",
          messageCreatedAt,
        },
      ],
    });
  });

  it("rejects a user who is not a participant of the conversation", async () => {
    participantRepository.getParticipantById.mockResolvedValue({
      value: null,
      error: new Error("Participant not found"),
    });

    const result = await useCase.execute(request);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/not a participant/);
    expect(
      participantRepository.updateLastReceivedMessage
    ).not.toHaveBeenCalled();
  });

  it("does not publish when the user had already received a later message", async () => {
    participantRepository.updateLastReceivedMessage.mockResolvedValue({
      value: false,
    });

    const result = await useCase.execute(request);

    expect(result).toEqual({ data: false });
    expect(
      messagePublisher.publishLastReceivedMessageUpdated
    ).not.toHaveBeenCalled();
  });
});
