import { inject, injectable } from "inversify";
import { RedisClientType } from "redis";

import config from "@config/index";
import { Session } from "@domain/entities";
import { TYPES } from "@infrastructure/external/di/inversify";
import { RepositoryResponse } from "@shared/responses";

interface IRedisRepository {
  /**
   * Create a session in the cache.
   *
   * @async
   * @param {Session} session - The session to be created.
   * @returns {Promise<void>}
   */
  createSession: (session: Session) => Promise<void>;

  /**
   * Retrieves a session from the cache by its ID.
   *
   * @async
   * @param {string} id - The ID of the session to retrieve.
   * @returns {Promise<RepositoryResponse<Session, Error>>} The retrieved session.
   */
  getSessionById: (id: string) => Promise<RepositoryResponse<Session, Error>>;

  /**
   * Deletes a session by its ID.
   *
   * @async
   * @param {string} id - The ID of the session to delete.
   * @returns {Promise<void>}
   */
  deleteSessionById: (id: string) => Promise<void>;
}

@injectable()
export class RedisRepository implements IRedisRepository {
  /**
   * Create an instance of RedisRepository
   *
   * @param {RedisClientType} redisClient - The redis client instance
   */
  constructor(
    @inject(TYPES.RedisClient) private redisClient: RedisClientType
  ) {}

  static basePrefix = "session:";

  private createKey(sessionId: string): string {
    return `${RedisRepository.basePrefix}${sessionId}`;
  }

  async createSession<T>(session: Session): Promise<void> {
    const sessionKey = this.createKey(session.sessionId);

    await this.redisClient.set(sessionKey, session.data, {
      EX: config.session.expire * 60 * 60,
    });
  }

  async getSessionById(
    sessionId: string
  ): Promise<RepositoryResponse<Session, Error>> {
    const sessionKey = this.createKey(sessionId);

    const session = await this.redisClient.get(sessionKey);

    if (!session) {
      return { error: new Error("Session not found"), value: null };
    }

    return { value: new Session(sessionId, session) };
  }

  async deleteSessionById(sessionId: string): Promise<void> {
    const sessionKey = this.createKey(sessionId);

    await this.redisClient.del(sessionKey);
  }
}
