import { ICreateConversationUsecase } from "@application/usecases/conversation";
import {
  IDetailedMessageRepositoryDTO,
  IDetailedParticipantDTO,
} from "@domain/dtos";
import { Conversation, Message, User } from "@domain/entities";
import { MessageType } from "@domain/enums";
import { IMessageEventPublisher } from "@domain/events";
import {
  IConversationRepository,
  IMessageRepository,
  IUserRepository,
} from "@domain/repositories";
import { ITransactionManager } from "@domain/services";
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
  let userRepository: jest.Mocked<IUserRepository>;
  let transactionManager: ITransactionManager;
  let logger: jest.Mocked<ILogger>;
  let useCase: CreateMessageUseCase;
  /** What happened, in order: begin, commit, rollback and publish. */
  let events: string[];

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
      findPrivateBetween: jest.fn().mockResolvedValue({ value: null }),
    } as unknown as jest.Mocked<IConversationRepository>;
    events = [];
    messagePublisher = {
      publishMessageSent: jest.fn(async () => {
        events.push("publish");
      }),
    } as unknown as jest.Mocked<IMessageEventPublisher>;
    userRepository = {
      lockUsersForUpdate: jest.fn().mockResolvedValue({ value: ["u1", "u2"] }),
      getUserById: jest.fn().mockResolvedValue({ value: { isActive: true } }),
    } as unknown as jest.Mocked<IUserRepository>;
    // A fake transaction that records commit and rollback.
    transactionManager = {
      run: async <T>(fn: () => Promise<T>): Promise<T> => {
        events.push("begin");
        try {
          const result = await fn();
          events.push("commit");
          return result;
        } catch (error) {
          events.push("rollback");
          throw error;
        }
      },
    };
    createConversationUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ICreateConversationUsecase>;
    logger = { error: jest.fn() } as unknown as jest.Mocked<ILogger>;

    useCase = new CreateMessageUseCase(
      messageRepository,
      conversationRepository,
      messagePublisher,
      createConversationUseCase,
      userRepository,
      transactionManager,
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

  it("saves inside the transaction and publishes after the commit", async () => {
    await useCase.execute(request);

    expect(events).toEqual(["begin", "commit", "publish"]);
  });

  it("returns the saved message when publishing fails", async () => {
    messagePublisher.publishMessageSent.mockRejectedValue(
      new Error("redis down")
    );

    const result = await useCase.execute(request);

    expect(result.error).toBeUndefined();
    expect(result.data).toEqual(expect.objectContaining({ id: "m1" }));
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("redis down")
    );
  });

  describe("first message to one user", () => {
    const firstMessage = {
      ...request,
      conversationId: null,
      receivers: ["u2"],
    };

    const savedConversationId = () =>
      (messageRepository.createMessage.mock.calls[0][0] as Message)
        .conversationId;

    it("reuses the existing direct conversation", async () => {
      conversationRepository.findPrivateBetween.mockResolvedValue({
        value: { id: "dm1" } as Conversation,
      });

      const result = await useCase.execute(firstMessage);

      expect(result.error).toBeUndefined();
      expect(createConversationUseCase.execute).not.toHaveBeenCalled();
      expect(savedConversationId()).toBe("dm1");
      expect(messagePublisher.publishMessageSent).toHaveBeenCalledWith(
        expect.objectContaining({ recipientUserIds: ["u1", "u2"] })
      );
    });

    it("locks the pair before reading the recipient or the conversation", async () => {
      await useCase.execute(firstMessage);

      expect(userRepository.lockUsersForUpdate).toHaveBeenCalledWith(
        "u1",
        "u2"
      );
      const lockOrder =
        userRepository.lockUsersForUpdate.mock.invocationCallOrder[0];
      expect(lockOrder).toBeLessThan(
        userRepository.getUserById.mock.invocationCallOrder[0]
      );
      expect(lockOrder).toBeLessThan(
        conversationRepository.findPrivateBetween.mock.invocationCallOrder[0]
      );
    });

    it("creates the direct conversation when there is none", async () => {
      createConversationUseCase.execute.mockResolvedValue({
        data: { id: "dm2" } as Conversation,
        error: null,
      });

      const result = await useCase.execute(firstMessage);

      expect(result.error).toBeUndefined();
      expect(createConversationUseCase.execute).toHaveBeenCalledWith({
        participants: ["u2"],
        userId: "u1",
      });
      expect(savedConversationId()).toBe("dm2");
      expect(events).toEqual(["begin", "commit", "publish"]);
    });

    it("rejects a message to yourself", async () => {
      const result = await useCase.execute({
        ...firstMessage,
        receivers: ["u1"],
      });

      expect(result).toEqual({
        data: null,
        error: "You can't send a direct message to yourself.",
      });
      expect(userRepository.lockUsersForUpdate).not.toHaveBeenCalled();
      expect(messageRepository.createMessage).not.toHaveBeenCalled();
      expect(events).toEqual(["begin", "rollback"]);
    });

    it("rejects an unknown recipient", async () => {
      userRepository.lockUsersForUpdate.mockResolvedValue({ value: ["u1"] });

      const result = await useCase.execute(firstMessage);

      expect(result).toEqual({
        data: null,
        error: "The recipient does not exist.",
      });
      expect(createConversationUseCase.execute).not.toHaveBeenCalled();
      expect(messagePublisher.publishMessageSent).not.toHaveBeenCalled();
    });

    it("rejects a sender whose user row no longer exists", async () => {
      userRepository.lockUsersForUpdate.mockResolvedValue({ value: ["u2"] });

      const result = await useCase.execute(firstMessage);

      expect(result).toEqual({
        data: null,
        error: "Your account no longer exists.",
      });
      expect(userRepository.getUserById).not.toHaveBeenCalled();
      expect(createConversationUseCase.execute).not.toHaveBeenCalled();
      expect(events).toEqual(["begin", "rollback"]);
    });

    it("rejects an inactive recipient", async () => {
      userRepository.getUserById.mockResolvedValue({
        value: { isActive: false } as User,
      });

      const result = await useCase.execute(firstMessage);

      expect(result).toEqual({
        data: null,
        error: "The recipient is no longer active.",
      });
      expect(createConversationUseCase.execute).not.toHaveBeenCalled();
    });

    it("treats the sender plus one other user as a direct message", async () => {
      conversationRepository.findPrivateBetween.mockResolvedValue({
        value: { id: "dm1" } as Conversation,
      });

      await useCase.execute({ ...firstMessage, receivers: ["u1", "u2"] });

      expect(userRepository.lockUsersForUpdate).toHaveBeenCalledWith(
        "u1",
        "u2"
      );
      expect(savedConversationId()).toBe("dm1");
    });

    it("rolls back the new conversation and publishes nothing when a later step fails", async () => {
      createConversationUseCase.execute.mockResolvedValue({
        data: { id: "dm2" } as Conversation,
        error: null,
      });
      conversationRepository.updateConversation.mockResolvedValue({
        value: null,
        error: new Error("db down"),
      });

      const result = await useCase.execute(firstMessage);

      expect(createConversationUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual({ data: null, error: "db down" });
      expect(events).toEqual(["begin", "rollback"]);
      expect(messagePublisher.publishMessageSent).not.toHaveBeenCalled();
    });
  });

  describe("first message to a group", () => {
    const groupMessage = {
      ...request,
      conversationId: null,
      receivers: ["u2", "u3"],
    };

    it("creates the group without locking a pair", async () => {
      createConversationUseCase.execute.mockResolvedValue({
        data: { id: "g1" } as Conversation,
        error: null,
      });

      const result = await useCase.execute(groupMessage);

      expect(result.error).toBeUndefined();
      expect(userRepository.lockUsersForUpdate).not.toHaveBeenCalled();
      expect(createConversationUseCase.execute).toHaveBeenCalledWith({
        participants: ["u2", "u3"],
        userId: "u1",
      });
      expect(
        (messageRepository.createMessage.mock.calls[0][0] as Message)
          .conversationId
      ).toBe("g1");
      expect(messagePublisher.publishMessageSent).toHaveBeenCalledWith(
        expect.objectContaining({ recipientUserIds: ["u1", "u2", "u3"] })
      );
    });

    it("rolls back and publishes nothing when the group can't be created", async () => {
      createConversationUseCase.execute.mockResolvedValue({
        data: null,
        error: "Invalid participants.",
      });

      const result = await useCase.execute(groupMessage);

      expect(result).toEqual({
        data: null,
        error: "Error starting conversation: Invalid participants.",
      });
      expect(events).toEqual(["begin", "rollback"]);
      expect(messageRepository.createMessage).not.toHaveBeenCalled();
    });

    it("still asks to create a conversation when there are no receivers", async () => {
      createConversationUseCase.execute.mockResolvedValue({
        data: null,
        error: "Invalid participants.",
      });

      const result = await useCase.execute({ ...groupMessage, receivers: [] });

      expect(createConversationUseCase.execute).toHaveBeenCalled();
      expect(result.error).toBe(
        "Error starting conversation: Invalid participants."
      );
    });
  });
});
