import { PrismaClient, User as UserPrismaModel } from "@prisma/client";
import { ILogger } from "@shared/logger";
import { UserPrismaRepository } from "./UserPrismaRepository";

const userRow = (id: string, firstName: string): UserPrismaModel => ({
  id,
  email: `${id}@example.com`,
  firstName,
  lastName: "Tester",
  role: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  avatar: null,
  isActive: true,
  lastSeenAt: null,
  status: null,
});

describe("UserPrismaRepository.searchUsers", () => {
  let findMany: jest.Mock;
  let logger: jest.Mocked<Pick<ILogger, "error">>;
  let repo: UserPrismaRepository;

  beforeEach(() => {
    findMany = jest.fn();
    logger = { error: jest.fn() };
    repo = new UserPrismaRepository(
      { user: { findMany } } as unknown as PrismaClient,
      logger as unknown as ILogger
    );
  });

  const baseQuery = {
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { id: "asc" }],
  };

  it("excludes the caller and inactive users, with no search filter or cursor on the first page", async () => {
    findMany.mockResolvedValue([]);

    await repo.searchUsers({ excludeUserId: "me", pagination: { limit: 10 } });

    expect(findMany).toHaveBeenCalledWith({
      ...baseQuery,
      where: { id: { not: "me" }, isActive: true },
      take: 11,
    });
  });

  it("ignores a whitespace-only search", async () => {
    findMany.mockResolvedValue([]);

    await repo.searchUsers({
      excludeUserId: "me",
      search: "   ",
      pagination: { limit: 10 },
    });

    expect(findMany.mock.calls[0][0].where).toEqual({
      id: { not: "me" },
      isActive: true,
    });
  });

  it("matches the trimmed term on names and email, and starts after the cursor", async () => {
    findMany.mockResolvedValue([]);

    await repo.searchUsers({
      excludeUserId: "me",
      search: "  ann ",
      pagination: { limit: 10, cursor: "u9" },
    });

    expect(findMany).toHaveBeenCalledWith({
      ...baseQuery,
      where: {
        id: { not: "me" },
        isActive: true,
        OR: [
          { firstName: { contains: "ann" } },
          { lastName: { contains: "ann" } },
          { email: { contains: "ann" } },
        ],
      },
      take: 11,
      cursor: { id: "u9" },
      skip: 1,
    });
  });

  it("returns limit rows and the last id as the cursor when there are more", async () => {
    findMany.mockResolvedValue([
      userRow("u1", "Ann"),
      userRow("u2", "Bob"),
      userRow("u3", "Cid"),
    ]);

    const { value, error } = await repo.searchUsers({
      excludeUserId: "me",
      pagination: { limit: 2 },
    });

    expect(error).toBeUndefined();
    expect(value.data.map((user) => user.id)).toEqual(["u1", "u2"]);
    expect(value.nextCursor).toBe("u2");
  });

  it("returns no cursor when the page is an exact fit", async () => {
    findMany.mockResolvedValue([userRow("u1", "Ann"), userRow("u2", "Bob")]);

    const { value } = await repo.searchUsers({
      excludeUserId: "me",
      pagination: { limit: 2 },
    });

    expect(value.data.map((user) => user.id)).toEqual(["u1", "u2"]);
    expect(value.nextCursor).toBeUndefined();
  });

  it("pages one user at a time with a limit of 1", async () => {
    findMany.mockResolvedValue([userRow("u1", "Ann"), userRow("u2", "Bob")]);

    const { value } = await repo.searchUsers({
      excludeUserId: "me",
      pagination: { limit: 1 },
    });

    expect(findMany.mock.calls[0][0].take).toBe(2);
    expect(value.data.map((user) => user.id)).toEqual(["u1"]);
    expect(value.nextCursor).toBe("u1");
  });

  it("returns an empty page and the error when the query fails", async () => {
    findMany.mockRejectedValue(new Error("db down"));

    const result = await repo.searchUsers({
      excludeUserId: "me",
      pagination: { limit: 10 },
    });

    expect(result.value).toEqual({ data: [], nextCursor: undefined });
    expect(result.error?.message).toBe("Error searching users: db down");
    expect(logger.error).toHaveBeenCalled();
  });
});
