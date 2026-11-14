import {
  PRESENCE_TTL_SECONDS,
  USER_PRESENCE_KEY_PREFIX,
} from "@shared/constants";
import { RedisClientType } from "redis";
import { UserPresenceRedisRepository } from "./UserPresenceRedisRepository";

describe("UserPresenceRedisRepository.getOnlineStatusByUserIds", () => {
  let hGetAll: jest.Mock;
  let execAsPipeline: jest.Mock;
  let multi: jest.Mock;
  let repo: UserPresenceRedisRepository;

  beforeEach(() => {
    hGetAll = jest.fn();
    execAsPipeline = jest.fn();
    multi = jest.fn(() => ({ hGetAll, execAsPipeline }));
    repo = new UserPresenceRedisRepository({
      multi,
    } as unknown as RedisClientType);
  });

  it("returns an empty map without calling Redis when there are no users", async () => {
    await expect(repo.getOnlineStatusByUserIds([])).resolves.toEqual({});
    expect(multi).not.toHaveBeenCalled();
  });

  it("reads every user in one pipeline and maps each reply to its user", async () => {
    execAsPipeline.mockResolvedValue([
      { isOnline: "true", lastSeenAt: "2026-11-05T10:00:00Z" },
      {},
      { isOnline: "false" },
    ]);

    const statuses = await repo.getOnlineStatusByUserIds(["u1", "u2", "u3"]);

    expect(multi).toHaveBeenCalledTimes(1);
    expect(hGetAll.mock.calls).toEqual([
      ["user-presence:u1"],
      ["user-presence:u2"],
      ["user-presence:u3"],
    ]);
    expect(statuses).toEqual({ u1: true, u2: false, u3: false });
  });

  it("passes a pipeline failure on to the caller", async () => {
    execAsPipeline.mockRejectedValue(new Error("redis down"));

    await expect(repo.getOnlineStatusByUserIds(["u1"])).rejects.toThrow(
      "redis down"
    );
  });
});

describe("UserPresenceRedisRepository.findOnlineUsers", () => {
  let scanIterator: jest.Mock;
  let hGetAll: jest.Mock;
  let execAsPipeline: jest.Mock;
  let multi: jest.Mock;
  let repo: UserPresenceRedisRepository;

  const scanReturns = (keys: string[]) =>
    scanIterator.mockImplementation(async function* () {
      yield* keys;
    });

  beforeEach(() => {
    scanIterator = jest.fn();
    hGetAll = jest.fn();
    execAsPipeline = jest.fn();
    multi = jest.fn(() => ({ hGetAll, execAsPipeline }));
    repo = new UserPresenceRedisRepository({
      scanIterator,
      multi,
    } as unknown as RedisClientType);
  });

  it("scans by the presence key prefix", async () => {
    scanReturns([]);

    await repo.findOnlineUsers();

    expect(scanIterator).toHaveBeenCalledWith(
      expect.objectContaining({ MATCH: `${USER_PRESENCE_KEY_PREFIX}*` })
    );
  });

  it("returns no users without opening a pipeline when no key matches", async () => {
    scanReturns([]);

    await expect(repo.findOnlineUsers()).resolves.toEqual([]);
    expect(multi).not.toHaveBeenCalled();
  });

  it("returns only the online users, with the user id taken from the key", async () => {
    scanReturns(["user-presence:u1", "user-presence:u2", "user-presence:u3"]);
    execAsPipeline.mockResolvedValue([
      { isOnline: "true", lastSeenAt: "2026-11-14T10:00:00.000Z" },
      { isOnline: "false", lastSeenAt: "2026-11-14T09:00:00.000Z" },
      {},
    ]);

    await expect(repo.findOnlineUsers()).resolves.toEqual([
      { userId: "u1", lastSeenAt: new Date("2026-11-14T10:00:00.000Z") },
    ]);
    expect(hGetAll.mock.calls).toEqual([
      ["user-presence:u1"],
      ["user-presence:u2"],
      ["user-presence:u3"],
    ]);
  });

  it("returns a user once when the scan yields their key twice", async () => {
    scanReturns(["user-presence:u1", "user-presence:u1"]);
    execAsPipeline.mockResolvedValue([
      { isOnline: "true", lastSeenAt: "2026-11-14T10:00:00.000Z" },
    ]);

    await expect(repo.findOnlineUsers()).resolves.toEqual([
      { userId: "u1", lastSeenAt: new Date("2026-11-14T10:00:00.000Z") },
    ]);
    expect(hGetAll).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["missing", { isOnline: "true" }],
    ["not a date", { isOnline: "true", lastSeenAt: "garbage" }],
  ])("reports lastSeenAt as null when it is %s", async (_case, hash) => {
    scanReturns(["user-presence:u1"]);
    execAsPipeline.mockResolvedValue([hash]);

    await expect(repo.findOnlineUsers()).resolves.toEqual([
      { userId: "u1", lastSeenAt: null },
    ]);
  });
});

describe("UserPresenceRedisRepository.markOffline", () => {
  it("sets only isOnline, keeping lastSeenAt, and refreshes the TTL", async () => {
    const hSet = jest.fn();
    const expire = jest.fn();
    const repo = new UserPresenceRedisRepository({
      hSet,
      expire,
    } as unknown as RedisClientType);

    await repo.markOffline("u1");

    expect(hSet).toHaveBeenCalledWith("user-presence:u1", {
      isOnline: "false",
    });
    expect(expire).toHaveBeenCalledWith(
      "user-presence:u1",
      PRESENCE_TTL_SECONDS
    );
  });
});
