import { PrismaClientProvider } from "@infrastructure/persistence/databases/mysql/PrismaClientProvider";
import { User as UserPrismaModel } from "@prisma/client";
import { lockUserPairForUpdate } from "@prisma/client/sql";
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

describe("UserPrismaRepository.lockUsersForUpdate", () => {
  let $queryRawTyped: jest.Mock;
  let provider: { client: unknown; inTransaction: boolean };
  let repo: UserPrismaRepository;

  beforeEach(() => {
    $queryRawTyped = jest.fn();
    provider = { client: { $queryRawTyped }, inTransaction: true };
    repo = new UserPrismaRepository(
      provider as unknown as PrismaClientProvider,
      { error: jest.fn() } as unknown as ILogger
    );
  });

  it("runs the lock query with both ids and returns the ids it locked", async () => {
    $queryRawTyped.mockResolvedValue([{ id: "u1" }, { id: "u2" }]);

    const result = await repo.lockUsersForUpdate("u2", "u1");

    expect($queryRawTyped).toHaveBeenCalledTimes(1);
    expect($queryRawTyped).toHaveBeenCalledWith(
      lockUserPairForUpdate("u2", "u1")
    );
    expect(result).toEqual({ value: ["u1", "u2"] });
  });

  it("refuses to run outside a transaction", async () => {
    provider.inTransaction = false;

    const result = await repo.lockUsersForUpdate("u1", "u2");

    expect($queryRawTyped).not.toHaveBeenCalled();
    expect(result.value).toEqual([]);
    expect(result.error?.message).toBe(
      "Locking users requires an open transaction"
    );
  });

  it("returns the error when the lock fails", async () => {
    $queryRawTyped.mockRejectedValue(new Error("lock wait timeout"));

    const result = await repo.lockUsersForUpdate("u1", "u2");

    expect(result.value).toEqual([]);
    expect(result.error?.message).toBe("Error locking users: lock wait timeout");
  });
});

describe("UserPrismaRepository.searchUsers", () => {
  let findMany: jest.Mock;
  let logger: jest.Mocked<Pick<ILogger, "error">>;
  let repo: UserPrismaRepository;

  beforeEach(() => {
    findMany = jest.fn();
    logger = { error: jest.fn() };
    repo = new UserPrismaRepository(
      { client: { user: { findMany } } } as unknown as PrismaClientProvider,
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
