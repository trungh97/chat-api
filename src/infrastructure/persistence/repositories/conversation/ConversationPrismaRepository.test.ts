import { Conversation } from "@domain/entities";
import { PrismaClientProvider } from "@infrastructure/persistence/databases/mysql/PrismaClientProvider";
import { ConversationType } from "@prisma/client";
import { ILogger } from "@shared/logger";
import { ConversationPrismaRepository } from "./ConversationPrismaRepository";

const conversationRow = (
  id: string,
  lastMessageAt: Date | null,
  createdAt = new Date("2026-01-01T00:00:00.000Z")
) => ({
  id,
  title: null,
  creatorId: "me",
  isArchived: false,
  deletedAt: null,
  type: ConversationType.PRIVATE,
  groupAvatar: null,
  createdAt,
  updatedAt: createdAt,
  lastMessageAt,
  lastMessageId: null,
  conversationParticipants: [],
  messages: [],
});

describe("ConversationPrismaRepository", () => {
  let findFirst: jest.Mock;
  let findMany: jest.Mock;
  let create: jest.Mock;
  let repo: ConversationPrismaRepository;

  beforeEach(() => {
    findFirst = jest.fn();
    findMany = jest.fn();
    create = jest.fn();
    repo = new ConversationPrismaRepository(
      {
        client: { conversation: { findFirst, findMany, create } },
      } as unknown as PrismaClientProvider,
      { error: jest.fn() } as unknown as ILogger
    );
  });

  describe("findPrivateBetween", () => {
    it("matches only a live PRIVATE conversation that has both users", async () => {
      findFirst.mockResolvedValue(null);

      await repo.findPrivateBetween("me", "u2");

      expect(findFirst).toHaveBeenCalledWith({
        where: {
          type: ConversationType.PRIVATE,
          deletedAt: null,
          AND: [
            { conversationParticipants: { some: { userId: "me" } } },
            { conversationParticipants: { some: { userId: "u2" } } },
          ],
        },
      });
    });

    it("returns null when there is none", async () => {
      findFirst.mockResolvedValue(null);

      await expect(repo.findPrivateBetween("me", "u2")).resolves.toEqual({
        value: null,
      });
    });

    it("returns the conversation when there is one", async () => {
      findFirst.mockResolvedValue(conversationRow("dm1", null));

      const { value, error } = await repo.findPrivateBetween("me", "u2");

      expect(error).toBeUndefined();
      expect(value?.id).toBe("dm1");
    });

    it("returns the error when the query fails", async () => {
      findFirst.mockRejectedValue(new Error("db down"));

      const result = await repo.findPrivateBetween("me", "u2");

      expect(result.value).toBeNull();
      expect(result.error?.message).toBe(
        "Error finding private conversation: db down"
      );
    });
  });

  describe("createConversation for two users", () => {
    const participants = [
      { id: "me", type: "MEMBER" as const, customTitle: "Ann" },
      { id: "u2", type: "MEMBER" as const, customTitle: "Me" },
    ];

    it("reuses the pair's 1:1 conversation found by the strict lookup", async () => {
      findFirst.mockResolvedValue(conversationRow("dm1", null));

      const { value } = await repo.createConversation(
        { id: "new" } as Conversation,
        participants
      );

      expect(findFirst.mock.calls[0][0].where).toEqual(
        expect.objectContaining({
          type: ConversationType.PRIVATE,
          deletedAt: null,
        })
      );
      expect(value?.id).toBe("dm1");
      expect(create).not.toHaveBeenCalled();
    });

    it("creates the conversation when the pair has none", async () => {
      findFirst.mockResolvedValue(null);
      create.mockResolvedValue(conversationRow("new", null));

      const { value } = await repo.createConversation(
        { id: "new" } as Conversation,
        participants
      );

      expect(create).toHaveBeenCalled();
      expect(value?.id).toBe("new");
    });
  });

  describe("getMyConversations next cursor", () => {
    it("falls back to createdAt when the next conversation has no message yet", async () => {
      const createdAt = new Date("2026-02-03T04:05:06.000Z");
      findMany.mockResolvedValue([
        conversationRow("c1", new Date("2026-03-01T00:00:00.000Z")),
        conversationRow("c2", null, createdAt),
      ]);

      const { value, error } = await repo.getMyConversations("me", {
        limit: 1,
      });

      expect(error).toBeUndefined();
      expect(value.nextCursor).toBe(createdAt.toISOString());
    });
  });
});
