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
