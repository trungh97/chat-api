import { PrismaClient, User as UserPrismaModel } from "@prisma/client";
import { inject, injectable } from "inversify";

import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/persistence/di/inversify";
import { ILogger } from "@infrastructure/persistence/logger";
import { RepositoryResponse } from "@shared/responses";

@injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  /**
   * Maps a User entity retrieved from the persistence layer to a User entity.
   *
   * @param {UserPrismaModel} user - The User entity retrieved from the persistence layer.
   * @returns {User} - The mapped User entity.
   */
  private toDomainFromPersistence(userPrismaModel: UserPrismaModel): User {
    return new User(userPrismaModel);
  }

  async getMe(): Promise<RepositoryResponse<User, Error>> {
    return Promise.reject(new Error("Not implemented"));
  }

  async createUser(user: User): Promise<RepositoryResponse<User, Error>> {
    const {
      id,
      email,
      firstName,
      lastName,
      role,
      password,
      phone,
      avatar,
      isActive,
      status,
    } = user;
    try {
      const createdUser = await this.prisma.user.create({
        data: {
          id,
          email,
          firstName,
          lastName,
          role,
          password,
          phone,
          avatar,
          isActive,
          status,
        },
      });

      if (!createdUser) {
        this.logger.error(`Fail to create user`);
        return {
          success: false,
          error: new Error("Failed to create user"),
          value: null,
        };
      }

      const response = this.toDomainFromPersistence(createdUser);

      return {
        success: true,
        value: response,
      };
    } catch (error) {
      this.logger.error(`Error creating user`);
      return {
        success: false,
        error: new Error(error.message),
        value: null,
      };
    }
  }
}
