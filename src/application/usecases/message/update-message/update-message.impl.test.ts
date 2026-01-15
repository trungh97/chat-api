import { IMessageRepository } from "@domain/repositories";
import { UpdateMessageUseCase } from "./update-message.impl";
import { MessageType } from "@domain/enums";

describe("UpdateMessageUseCase", () => {
  let messageRepository: IMessageRepository;
  let logger: any;
  let useCase: UpdateMessageUseCase;

  beforeEach(() => {
    messageRepository = {
      getMessageById: jest.fn(),
      updateMessage: jest.fn(),
      updateMessageStatus: jest.fn(),
      deleteMessage: jest.fn(),
      createMessage: jest.fn(),
      getLastMessageByConversationId: jest.fn(),
      getMessagesByConversationId: jest.fn(),
    };
    logger = { error: jest.fn() };
    useCase = new UpdateMessageUseCase(messageRepository, logger);
  });

  it("returns error if message not found", async () => {
    (messageRepository.getMessageById as jest.Mock).mockResolvedValue({
      value: null,
      error: new Error("not found"),
    });
    const result = await useCase.execute({
      id: "1",
      updates: { content: "hi" },
      userId: "u1",
    });
    expect(result.data).toBeNull();
    expect(result.error).toBe("not found");
  });

  it("returns error if user is not sender", async () => {
    (messageRepository.getMessageById as jest.Mock).mockResolvedValue({
      value: { senderId: "u2" },
      error: null,
    });
    const result = await useCase.execute({
      id: "1",
      updates: { content: "hi" },
      userId: "u1",
    });
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/permission/);
  });

  it("returns error if update fails", async () => {
    (messageRepository.getMessageById as jest.Mock).mockResolvedValue({
      value: { senderId: "u1" },
      error: null,
    });
    (messageRepository.updateMessage as jest.Mock).mockResolvedValue({
      value: null,
      error: new Error("fail"),
    });
    const result = await useCase.execute({
      id: "1",
      updates: { content: "hi" },
      userId: "u1",
    });
    expect(result.data).toBeNull();
    expect(result.error).toBe("fail");
  });

  it("returns custom error if update fails", async () => {
    (messageRepository.getMessageById as jest.Mock).mockResolvedValue({
      value: { senderId: "u1" },
      error: null,
    });
    (messageRepository.updateMessage as jest.Mock).mockResolvedValue({
      value: null,
      error: new Error(""),
    });
    const result = await useCase.execute({
      id: "1",
      updates: { content: "hi" },
      userId: "u1",
    });
    expect(result.data).toBeNull();
    expect(result.error).toBe("Failed to update message");
  });

  it("returns internal error if update fails", async () => {
    (messageRepository.getMessageById as jest.Mock).mockResolvedValue({
      value: { senderId: "u1" },
      error: null,
    });
    (messageRepository.updateMessage as jest.Mock).mockResolvedValue({
      value: null,
      error: new Error(""),
    });
    const result = await useCase.execute({
      id: null,
      updates: { content: "hi" },
      userId: "u1",
    });
    expect(result.data).toBeNull();
    expect(result.error).toContain("Error executing update message use case:");
  });

  it("returns success if update succeeds", async () => {
    (messageRepository.getMessageById as jest.Mock).mockResolvedValue({
      value: {
        senderId: "u1",
        content: "hello",
      },
      error: null,
    });
    (messageRepository.updateMessage as jest.Mock).mockResolvedValue({
      value: {
        id: "1",
        content: "hi",
        senderId: "u1",
        sender: {
          firstName: "John",
          lastName: "Doe",
          avatar: null,
        },
        messageType: MessageType.TEXT,
        conversationId: "c1",
        createdAt: new Date(),
      },
      error: null,
    });
    const result = await useCase.execute({
      id: "1",
      updates: { content: "hi" },
      userId: "u1",
    });
    expect(result.data).toBeTruthy();
    expect(result.error).toBeUndefined();
  });
});
