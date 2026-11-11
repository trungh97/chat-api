import { IUserPresenceReader } from "@domain/cache";
import { IUserRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { PAGE_LIMIT } from "@shared/constants";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { SearchUsersRequest } from "./search-users.request";
import { SearchUsersResponse } from "./search-users.response";
import { ISearchUsersUseCase } from "./search-users.usecase";

export const MAX_SEARCH_USERS_LIMIT = 50;

@injectable()
export class SearchUsersUseCase implements ISearchUsersUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserPresenceReader)
    private userPresenceReader: IUserPresenceReader,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute({
    userId,
    search,
    pagination,
  }: SearchUsersRequest): Promise<SearchUsersResponse> {
    try {
      if (!userId) {
        return { data: null, error: "User is not authenticated" };
      }

      const limit = Math.min(
        Math.max(Math.floor(pagination.limit) || PAGE_LIMIT, 1),
        MAX_SEARCH_USERS_LIMIT
      );

      const { value, error } = await this.userRepository.searchUsers({
        excludeUserId: userId,
        search,
        pagination: { cursor: pagination.cursor, limit },
      });

      if (error) {
        return { data: null, error: error.message };
      }

      const onlineStatuses = await this.getOnlineStatuses(
        value.data.map((user) => user.id)
      );

      return {
        data: {
          data: value.data.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar ?? null,
            isOnline: onlineStatuses[user.id] ?? false,
          })),
          nextCursor: value.nextCursor,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error searching users: ${message}`);
      return { data: null, error: "Failed to search users." };
    }
  }

  /**
   * Online status is a nice-to-have snapshot, so a Redis failure shows everyone as
   * offline instead of failing the search.
   */
  private async getOnlineStatuses(
    userIds: string[]
  ): Promise<Record<string, boolean>> {
    try {
      return await this.userPresenceReader.getOnlineStatusByUserIds(userIds);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error reading online status: ${message}`);
      return {};
    }
  }
}
