import { IUserPresenceReader } from "@domain/cache";
import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { ILogger } from "@shared/logger";
import { MAX_SEARCH_USERS_LIMIT, SearchUsersUseCase } from "./search-users.impl";

const user = (id: string, firstName: string, avatar?: string) =>
  ({
    id,
    email: `${id}@example.com`,
    firstName,
    lastName: "Tester",
    avatar,
  }) as User;

describe("SearchUsersUseCase", () => {
  let userRepository: jest.Mocked<Pick<IUserRepository, "searchUsers">>;
  let presenceReader: jest.Mocked<IUserPresenceReader>;
  let useCase: SearchUsersUseCase;

  beforeEach(() => {
    userRepository = { searchUsers: jest.fn() };
    presenceReader = { getOnlineStatusByUserIds: jest.fn() };
    useCase = new SearchUsersUseCase(
      userRepository as unknown as IUserRepository,
      presenceReader,
      { error: jest.fn() } as unknown as ILogger
    );
  });

  it("excludes the caller and passes the search term and cursor through", async () => {
    userRepository.searchUsers.mockResolvedValue({
      value: { data: [], nextCursor: undefined },
    });
    presenceReader.getOnlineStatusByUserIds.mockResolvedValue({});

    await useCase.execute({
      userId: "me",
      search: "ann",
      pagination: { limit: 10, cursor: "u9" },
    });

    expect(userRepository.searchUsers).toHaveBeenCalledWith({
      excludeUserId: "me",
      search: "ann",
      pagination: { limit: 10, cursor: "u9" },
    });
  });

  it("caps the page size", async () => {
    userRepository.searchUsers.mockResolvedValue({
      value: { data: [], nextCursor: undefined },
    });
    presenceReader.getOnlineStatusByUserIds.mockResolvedValue({});

    await useCase.execute({ userId: "me", pagination: { limit: 1000 } });

    expect(userRepository.searchUsers.mock.calls[0][0].pagination.limit).toBe(
      MAX_SEARCH_USERS_LIMIT
    );
  });

  it("merges online status and keeps the next cursor", async () => {
    userRepository.searchUsers.mockResolvedValue({
      value: {
        data: [user("u1", "Ann", "a.png"), user("u2", "Bob")],
        nextCursor: "u2",
      },
    });
    presenceReader.getOnlineStatusByUserIds.mockResolvedValue({ u1: true });

    const result = await useCase.execute({
      userId: "me",
      pagination: { limit: 2 },
    });

    expect(presenceReader.getOnlineStatusByUserIds).toHaveBeenCalledWith([
      "u1",
      "u2",
    ]);
    expect(result.data).toEqual({
      data: [
        {
          id: "u1",
          email: "u1@example.com",
          firstName: "Ann",
          lastName: "Tester",
          avatar: "a.png",
          isOnline: true,
        },
        {
          id: "u2",
          email: "u2@example.com",
          firstName: "Bob",
          lastName: "Tester",
          avatar: null,
          isOnline: false,
        },
      ],
      nextCursor: "u2",
    });
  });

  it("returns the repository error", async () => {
    userRepository.searchUsers.mockResolvedValue({
      value: { data: [], nextCursor: undefined },
      error: new Error("db down"),
    });

    const result = await useCase.execute({
      userId: "me",
      pagination: { limit: 20 },
    });

    expect(result).toEqual({ data: null, error: "db down" });
    expect(presenceReader.getOnlineStatusByUserIds).not.toHaveBeenCalled();
  });
});
