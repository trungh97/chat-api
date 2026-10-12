import { ICreateConversationUsecase } from "@application/usecases/conversation";
import {
  IDetailedMessageRepositoryDTO,
  IDetailedParticipantDTO,
} from "@domain/dtos";
import { Conversation, Message } from "@domain/entities";
import { MessageType } from "@domain/enums";
import { IMessageEventPublisher } from "@domain/events";
import {
  IConversationRepository,
  IMessageRepository,
} from "@domain/repositories";
import { ILogger } from "@shared/logger";
import { CreateMessageUseCase } from "./create-message.impl";

describe("CreateMessageUseCase", () => {
  const savedMessage: IDetailedMessageRepositoryDTO = {
    id: "m1",
    senderId: "u1",
    sender: { firstName: "Alice", lastName: "Smith", avatar: null },
    content: "hello",
    messageType: MessageType.TEXT,
    createdAt: new Date("2026-10-01T10:00:00.000Z"),
    conversationId: "c1",
    status: undefined,
    clientMessageId: "client-1",
  };
  const request = {
    conversationId: "c1",
    content: "hello",
    messageType: MessageType.TEXT,
    currentUserId: "u1",
    clientMessageId: "client-1",
  };

  let messageRepository: jest.Mocked<IMessageRepository>;
  let conversationRepository: jest.Mocked<IConversationRepository>;
  let messagePublisher: jest.Mocked<IMessageEventPublisher>;
  let createConversationUseCase: jest.Mocked<ICreateConversationUsecase>;
  let logger: jest.Mocked<ILogger>;
  let useCase: CreateMessageUseCase;

  beforeEach(() => {
    messageRepository = {
      getMessageByClientMessageId: jest.fn().mockResolvedValue({ value: null }),
      createMessage: jest.fn().mockResolvedValue({ value: savedMessage }),
    } as unknown as jest.Mocked<IMessageRepository>;
    conversationRepository = {
      getConversationById: jest.fn().mockResolvedValue({
        value: {
          conversation: { id: "c1" } as Conversation,
          participants: [
            { id: "p1", userId: "u1" },
            { id: "p2", userId: "u2" },
          ] as IDetailedParticipantDTO[],
          messages: [],
        },
      }),
      updateConversation: jest.fn().mockResolvedValue({ value: {} }),
    } as unknown as jest.Mocked<IConversationRepository>;
    messagePublisher = {
      publishMessageSent: jest.fn(),
    } as unknown as jest.Mocked<IMessageEventPublisher>;
    createConversationUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ICreateConversationUsecase>;
    logger = { error: jest.fn() } as unknown as jest.Mocked<ILogger>;

    useCase = new CreateMessageUseCase(
      messageRepository,
      conversationRepository,
      messagePublisher,
      createConversationUseCase,
      logger
    );
  });

  it("saves the client message id and publishes to the conversation's participants", async () => {
    const result = await useCase.execute(request);

    expect(result.error).toBeUndefined();
    expect(result.data).toEqual(
      expect.objectContaining({ id: "m1", clientMessageId: "client-1" })
    );
    const createdEntity = messageRepository.createMessage.mock
      .calls[0][0] as Message;
    expect(createdEntity.clientMessageId).toBe("client-1");
    expect(messagePublisher.publishMessageSent).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUserIds: ["u1", "u2"] })
    );
  });

  it("returns the existing message for a retried client message id without saving or publishing again", async () => {
    messageRepository.getMessageByClientMessageId.mockResolvedValue({
      value: savedMessage,
    });

    const result = await useCase.execute(request);

    expect(result.data).toEqual(expect.objectContaining({ id: "m1" }));
    expect(messageRepository.getMessageByClientMessageId).toHaveBeenCalledWith(
      "u1",
      "client-1"
    );
    expect(messageRepository.createMessage).not.toHaveBeenCalled();
    expect(messagePublisher.publishMessageSent).not.toHaveBeenCalled();
  });

  it("rejects a client message id already used in another conversation", async () => {
    messageRepository.getMessageByClientMessageId.mockResolvedValue({
      value: { ...savedMessage, conversationId: "other" },
    });

    const result = await useCase.execute(request);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/another conversation/);
    expect(messageRepository.createMessage).not.toHaveBeenCalled();
  });

  it("rejects a client message id longer than the column", async () => {
    const result = await useCase.execute({
      ...request,
      clientMessageId: "x".repeat(65),
    });

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/Client message id/);
    expect(messageRepository.createMessage).not.toHaveBeenCalled();
  });

  it("rejects a sender who is not a participant", async () => {
    conversationRepository.getConversationById.mockResolvedValue({
      value: {
        conversation: { id: "c1" } as Conversation,
        participants: [{ id: "p2", userId: "u2" }] as IDetailedParticipantDTO[],
        messages: [],
      },
    });

    const result = await useCase.execute(request);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/not a participant/);
    expect(messageRepository.createMessage).not.toHaveBeenCalled();
  });
});
