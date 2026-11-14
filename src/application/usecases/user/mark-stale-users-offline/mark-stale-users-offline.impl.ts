import { IUserPresenceStore } from "@domain/cache";
import { IMessageEventPublisher } from "@domain/events";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { MarkStaleUsersOfflineRequest } from "./mark-stale-users-offline.request";
import { MarkStaleUsersOfflineResponse } from "./mark-stale-users-offline.response";
import { IMarkStaleUsersOfflineUseCase } from "./mark-stale-users-offline.usecase";

/**
 * Implementation of the MarkStaleUsersOfflineUseCase.
 */
@injectable()
export class MarkStaleUsersOfflineUseCase
  implements IMarkStaleUsersOfflineUseCase
{
  constructor(
    @inject(TYPES.UserPresenceStore)
    private readonly userPresenceStore: IUserPresenceStore,

    @inject(TYPES.MessagePublisher)
    private readonly publisher: IMessageEventPublisher,

    @inject(TYPES.WinstonLogger)
    private readonly logger: ILogger
  ) {}

  async execute({
    thresholdSeconds,
  }: MarkStaleUsersOfflineRequest): Promise<MarkStaleUsersOfflineResponse> {
    try {
      const now = new Date();
      const staleBefore = now.getTime() - thresholdSeconds * 1_000;

      const onlineUsers = await this.userPresenceStore.findOnlineUsers();
      // A record with no readable time can't prove the user is still here, so it counts as stale.
      const staleUsers = onlineUsers.filter(
        ({ lastSeenAt }) => !lastSeenAt || lastSeenAt.getTime() < staleBefore
      );

      for (const { userId, lastSeenAt } of staleUsers) {
        await this.userPresenceStore.markOffline(userId);
        await this.publisher.publishPresenseUpdate({
          userId,
          isOnline: false,
          lastSeenAt: lastSeenAt ?? now,
        });
      }

      if (staleUsers.length > 0) {
        this.logger.info(
          `Marked ${staleUsers.length} user(s) offline after ${thresholdSeconds}s without a heartbeat`
        );
      }

      return { data: staleUsers.length };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to mark stale users offline";
      this.logger.error(`Error marking stale users offline: ${message}`);
      return { data: null, error: message };
    }
  }
}
