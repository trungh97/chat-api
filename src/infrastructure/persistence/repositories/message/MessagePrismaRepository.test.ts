import { PrismaClient } from "@prisma/client";
import { ILogger } from "@shared/logger";
import { MessagePrismaRepository } from "./MessagePrismaRepository";

describe("MessagePrismaRepository", () => {
  let prisma: jest.Mocked<PrismaClient>;
  let logger: jest.Mocked<ILogger>;
  let repo: MessagePrismaRepository;

  beforeEach(() => {
    prisma = {
      message: {
        create: jest.fn() as jest.Mock,
        findUnique: jest.fn() as jest.Mock,
        update: jest.fn() as jest.Mock,
        findMany: jest.fn() as jest.Mock,
        findFirst: jest.fn() as jest.Mock,
      },
      deletedMessage: {
        create: jest.fn() as jest.Mock,
      },
    } as any;
    logger = { error: jest.fn() } as any;
    repo = new MessagePrismaRepository(prisma, logger);
  });

  it("createMessage: should create and return a message DTO", async () => {
    (prisma.message.create as jest.Mock).mockResolvedValue({
      id: "1",
      content: "hi",
      messageType: "TEXT",
      conversationId: "c1",
      extra: "{}",
      replyToMessageId: "2",
      senderId: "u1",
    });

    const result = await repo.createMessage({
      id: "1",
      content: "hi",
      messageType: "TEXT",
      conversationId: "c1",
      extra: {},
      replyToMessageId: "2",
      senderId: "u1",
      createdAt: new Date(),
    } as any);

    expect(result.value).toBeTruthy();
    expect(prisma.message.create).toHaveBeenCalled();
  });

  it("createMessage: should throw the error when missing fields", async () => {
    (prisma.message.create as jest.Mock).mockRejectedValue(
      new Error("Failed to create message")
    );

    const result = await repo.createMessage({} as any);

    expect(result.value).toBeNull();
    expect(result.error.message).toContain("Error creating message:");
    expect(prisma.message.create).toHaveBeenCalled();
  });

  it("getMessageById: returns message DTO if found", async () => {
    (prisma.message.findUnique as jest.Mock).mockResolvedValue({
      id: "1",
      content: "hi",
      messageType: "TEXT",
      conversationId: "c1",
      extra: "{}",
      senderId: "u1",
    });
    const result = await repo.getMessageById("1");
    expect(result.value).toBeTruthy();
    expect(prisma.message.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });

  it("getMessageById: should throw the error when findUnique fails", async () => {
    (prisma.message.findUnique as jest.Mock).mockRejectedValue(
      new Error("Message not found")
    );

    const result = await repo.getMessageById("1");

    expect(result.value).toBeNull();
    expect(result.error.message).toContain("Error fetching message by id");
  });

  it("getMessageById: should throw the error when the message result is invalid", async () => {
    (prisma.message.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repo.getMessageById("1");

    expect(result.value).toBeNull();
    expect(result.error.message).toContain("Message with id 1 not found");
  });

  it("updateMessage: updates and returns message DTO", async () => {
    (prisma.message.update as jest.Mock).mockResolvedValue({
      id: "1",
      content: "updated",
      messageType: "TEXT",
      conversationId: "c1",
      extra: "{}",
      senderId: "u1",
    });
    const result = await repo.updateMessage("1", { content: "updated" });
    expect(result.value).toBeTruthy();
    expect(prisma.message.update).toHaveBeenCalled();
  });

  it("updateMessage: should throw the error when updateMessage fails", async () => {
    (prisma.message.update as jest.Mock).mockRejectedValue(
      new Error("Failed to update message")
    );

    const result = await repo.updateMessage("1", { content: "updated" });

    expect(result.value).toBeNull();
    expect(result.error.message).toContain("Error updating message with id");
  });

  it("deleteMessage: soft deletes and logs deleted message", async () => {
    (prisma.message.update as jest.Mock).mockResolvedValue({
      id: "1",
      senderId: "u1",
      deletedAt: new Date(),
    });
    (prisma.deletedMessage.create as jest.Mock).mockResolvedValue({ id: "d1" });
    const result = await repo.deleteMessage("1");
    expect(result.value).toBe(true);
    expect(prisma.message.update).toHaveBeenCalled();
    expect(prisma.deletedMessage.create).toHaveBeenCalled();
  });

  it("deleteMessage: no deletedAt response", async () => {
    (prisma.message.update as jest.Mock).mockResolvedValue({
      id: "1",
      senderId: "u1",
    });
    (prisma.deletedMessage.create as jest.Mock).mockResolvedValue({ id: "d1" });
    const result = await repo.deleteMessage("1");

    expect(result.value).toBe(true);
    expect(prisma.message.update).toHaveBeenCalled();
    expect(prisma.deletedMessage.create).toHaveBeenCalledTimes(0); // should not be called();
  });

  it("deleteMessage: throws error if soft delete fails", async () => {
    (prisma.message.update as jest.Mock).mockResolvedValue(null);
    (prisma.deletedMessage.create as jest.Mock).mockResolvedValue({ id: "d1" });

    const result = await repo.deleteMessage("1");

    expect(result.value).toBe(false);
    expect(result.error.message).toContain("Message with id 1 not found");
    expect(prisma.message.update).toHaveBeenCalled();
    expect(prisma.deletedMessage.create).toHaveBeenCalledTimes(0); // should not be called();
  });

  it("deleteMessage: throws error if creating deleted message fails", async () => {
    (prisma.message.update as jest.Mock).mockResolvedValue({
      id: "1",
      senderId: "u1",
      deletedAt: new Date(),
    });
    (prisma.deletedMessage.create as jest.Mock).mockResolvedValue(null);

    const result = await repo.deleteMessage("1");

    expect(result.value).toBe(false);
    expect(result.error.message).toContain(
      "Failed to log deleted message record"
    );
    expect(prisma.message.update).toHaveBeenCalled();
    expect(prisma.deletedMessage.create).toHaveBeenCalled();
  });

  it("deleteMessage: throws internal error if message id is not found", async () => {
    (prisma.message.update as jest.Mock).mockResolvedValue({
      id: "1",
      senderId: "u1",
      deletedAt: new Date(),
    });
    (prisma.deletedMessage.create as jest.Mock).mockResolvedValue(null);

    const result = await repo.deleteMessage(null);

    expect(result.value).toBe(false);
    expect(result.error.message).toContain("Error deleting message with id");
    expect(prisma.message.update).toHaveBeenCalledTimes(0); // should not be called();
    expect(prisma.deletedMessage.create).toHaveBeenCalledTimes(0); // should not be called();
  });

  it("getMessagesByConversationId: returns paginated messages", async () => {
    (prisma.message.findMany as jest.Mock).mockResolvedValue([
      {
        id: "1",
        content: "hi",
        messageType: "TEXT",
        conversationId: "c1",
        extra: "{}",
        senderId: "u1",
      },
      {
        id: "2",
        content: "hello",
        messageType: "TEXT",
        conversationId: "c1",
        extra: "{}",
        senderId: "u1",
      },
    ]);
    const result = await repo.getMessagesByConversationId("c1", "1", 1);
    expect(result.value.data.length).toBeGreaterThanOrEqual(1);
    expect(result.value.nextCursor).toBe("2");
    expect(prisma.message.findMany).toHaveBeenCalled();
  });

  it("getMessagesByConversationId: returns paginated messages and no nextCursor", async () => {
    (prisma.message.findMany as jest.Mock).mockResolvedValue([
      {
        id: "1",
        content: "hi",
        messageType: "TEXT",
        conversationId: "c1",
        extra: "{}",
        senderId: "u1",
      },
    ]);
    const result = await repo.getMessagesByConversationId("c1", "1", 1);
    expect(result.value.data.length).toBeGreaterThanOrEqual(1);
    expect(result.value.nextCursor).toBeUndefined();
    expect(prisma.message.findMany).toHaveBeenCalled();
  });

  it("getMessagesByConversationId: throw internal error", async () => {
    (prisma.message.findMany as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch messages")
    );
    const result = await repo.getMessagesByConversationId("c1");

    expect(result.value).toBeNull();
    expect(result.error.message).toContain(
      "Error fetching messages for conversation"
    );
    expect(prisma.message.findMany).toHaveBeenCalled();
  });

  it("getLastMessageByConversationId: returns last message", async () => {
    (prisma.message.findFirst as jest.Mock).mockResolvedValue({
      id: "1",
      content: "hi",
      messageType: "TEXT",
      conversationId: "c1",
      extra: "{}",
      senderId: "u1",
    });
    const result = await repo.getLastMessageByConversationId("c1");
    expect(result.value).toBeTruthy();
    expect(prisma.message.findFirst).toHaveBeenCalled();
  });

  it("getLastMessageByConversationId: throws internal error", async () => {
    (prisma.message.findFirst as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch last message")
    );
    const result = await repo.getLastMessageByConversationId("c1");

    expect(result.value).toBeNull();
    expect(result.error.message).toContain(
      "Error fetching last message for conversation"
    );
    expect(prisma.message.findFirst).toHaveBeenCalled();
  });

  it("getLastMessageByConversationId: throws message not found error", async () => {
    (prisma.message.findFirst as jest.Mock).mockResolvedValue(null);
    const result = await repo.getLastMessageByConversationId("c1");

    expect(result.value).toBeNull();
    expect(result.error.message).toContain(
      "No messages found for conversation"
    );
    expect(prisma.message.findFirst).toHaveBeenCalled();
  });
});
