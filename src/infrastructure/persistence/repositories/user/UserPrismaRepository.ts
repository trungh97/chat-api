import { User } from "@domain/entities";
import {
  ICursorBasedPaginationParams,
  ICursorBasedPaginationResponse,
} from "@domain/interfaces/pagination/CursorBasedPagination";
import { IUserRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { PrismaClientProvider } from "@infrastructure/persistence/databases/mysql/PrismaClientProvider";
import {
  CredentialBasedAuth as CredentialBasedAuthPrismaModel,
  FederatedCredential as FederatedCredentialPrismaModel,
  User as UserPrismaModel,
} from "@prisma/client";
import { lockUserPairForUpdate } from "@prisma/client/sql";
import { PAGE_LIMIT } from "@shared/constants";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaClientProvider)
    private clientProvider: PrismaClientProvider,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  /** The open transaction, if any, otherwise the root client. */
  private get prisma() {
    return this.clientProvider.client;
  }

  /**
   * Maps a user entity retrieved from the persistence layer to a user entity in the domain model.
   *
   * @param {UserPrismaModel} userPrismaModel the user entity from the Prisma model
   * @param {FederatedCredentialPrismaModel} federatedCredentialPrismaModel the federated credential entity from the Prisma model
   * @param {CredentialBasedAuthPrismaModel} credentialBasedPrismaModel the credential based auth entity from the Prisma model
   * @returns {User} the mapped user entity in the domain model
   */
  private toDomainFromPersistence(
    userPrismaModel: UserPrismaModel,
    federatedCredentialPrismaModel?: FederatedCredentialPrismaModel,
    credentialBasedPrismaModel?: CredentialBasedAuthPrismaModel,
    options?: { includePassword?: boolean }
  ) {
    const user = {
      ...userPrismaModel,
      ...(credentialBasedPrismaModel && {
        phone: credentialBasedPrismaModel.phone,
        ...(options?.includePassword && {
          password: credentialBasedPrismaModel.password,
        }),
      }),
      ...(federatedCredentialPrismaModel && {
        provider: federatedCredentialPrismaModel.provider,
        providerUserId: federatedCredentialPrismaModel.providerUserId,
      }),
    };
    return new User(user);
  }

  async findUserByEmail(
    email: string
  ): Promise<RepositoryResponse<User, Error>> {
    try {
      const foundUser = await this.prisma.user.findUnique({
        where: { email },
        include: {
          federatedCredential: true,
          credentialBased: true,
        },
      });

      if (!foundUser) {
        return {
          error: new Error("User not found"),
          value: null,
        };
      }

      const { federatedCredential, credentialBased } = foundUser;

      return {
        value: this.toDomainFromPersistence(
          foundUser,
          federatedCredential,
          credentialBased,
          { includePassword: true }
        ),
      };
    } catch (error) {
      this.logger.error(`Error getting user by email ${email}`);
      return {
        error: new Error(`Error getting user by email ${email}`),
        value: null,
      };
    }
  }

  async getUserById(id: string): Promise<RepositoryResponse<User, Error>> {
    try {
      // Find if the user exists in the database
      const foundUser = await this.prisma.user.findUnique({
        where: { id },
        include: {
          federatedCredential: true,
          credentialBased: true,
        },
      });

      if (!foundUser.id) {
        return {
          error: new Error("User not found"),
          value: null,
        };
      }

      const { federatedCredential, credentialBased, ...generalInfo } =
        foundUser;

      // If found, check if the user is federated credential user (login with third-party provider)
      // If not, return the credential based user
      if (!federatedCredential || !federatedCredential.provider) {
        return {
          value: this.toDomainFromPersistence(
            generalInfo,
            null,
            credentialBased
          ),
        };
      }

      // Else return the federated credential user
      return {
        value: this.toDomainFromPersistence(generalInfo, federatedCredential),
      };
    } catch (error) {
      this.logger.error(`Error getting user by id ${id}`);
      return {
        error: new Error(`Error getting user by id ${id}`),
        value: null,
      };
    }
  }

  async createCredentialBasedUser(
    user: User
  ): Promise<RepositoryResponse<User, Error>> {
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
          avatar,
          isActive,
          status,
        },
      });

      if (!createdUser) {
        this.logger.error(`Failed to create credential based user`);
        return {
          error: new Error("Failed to create credential based user"),
          value: null,
        };
      }

      const createdUserId = createdUser.id;

      const createdCredentialBasedAuthUser =
        await this.prisma.credentialBasedAuth.create({
          data: {
            userId: createdUserId,
            password,
            phone,
          },
        });

      if (!createdCredentialBasedAuthUser) {
        this.logger.error(`Fail to create credential based auth user`);
        return {
          error: new Error("Failed to create credential based auth user"),
          value: null,
        };
      }

      const response = this.toDomainFromPersistence(
        createdUser,
        null,
        createdCredentialBasedAuthUser
      );

      return {
        value: response,
      };
    } catch (error) {
      this.logger.error(`Error creating credential based user`);
      return {
        error: new Error(error.message),
        value: null,
      };
    }
  }

  async getCredentialBasedUserById(
    id: string
  ): Promise<RepositoryResponse<User, Error>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return {
          error: new Error("User not found"),
          value: null,
        };
      }

      const credentialBasedAuthUser =
        await this.prisma.credentialBasedAuth.findUnique({
          where: { userId: id },
        });

      if (!credentialBasedAuthUser) {
        return {
          error: new Error("Credential based auth user not found"),
          value: null,
        };
      }

      return {
        value: this.toDomainFromPersistence(
          user,
          null,
          credentialBasedAuthUser
        ),
      };
    } catch (error) {
      this.logger.error(`Error getting credential based user by id ${id}`);
      return {
        error: new Error(error.message),
        value: null,
      };
    }
  }

  async createFederatedCredentialUser(
    user: User
  ): Promise<RepositoryResponse<User, Error>> {
    const {
      id,
      email,
      firstName,
      lastName,
      role,
      avatar,
      isActive,
      status,
      provider,
      providerUserId,
    } = user;
    try {
      const createdUser = await this.prisma.user.create({
        data: {
          id,
          email,
          firstName,
          lastName,
          role,
          avatar,
          isActive,
          status,
        },
      });

      if (!createdUser) {
        this.logger.error(`Failed to create federated credential user`);
        return {
          error: new Error("Failed to create federated credential user"),
          value: null,
        };
      }

      const createdUserId = createdUser.id;

      const createdFederatedUser = await this.prisma.federatedCredential.create(
        {
          data: {
            userId: createdUserId,
            provider,
            providerUserId,
          },
        }
      );

      if (!createdFederatedUser) {
        this.logger.error(`Fail to create federated credential user`);
        return {
          error: new Error("Failed to create federated credential user"),
          value: null,
        };
      }

      const response = this.toDomainFromPersistence(
        createdUser,
        createdFederatedUser
      );

      return {
        value: response,
      };
    } catch (error) {
      this.logger.error(`Error creating federated credential user`);
      return {
        error: new Error(error.message),
        value: null,
      };
    }
  }

  async getFederatedCredentialUserById(
    id: string
  ): Promise<RepositoryResponse<User, Error>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return {
          error: new Error("User not found"),
          value: null,
        };
      }

      const federatedCredentialUser =
        await this.prisma.federatedCredential.findUnique({
          where: { userId: id },
        });

      if (!federatedCredentialUser) {
        return {
          error: new Error("Federated credential user not found"),
          value: null,
        };
      }

      return {
        value: this.toDomainFromPersistence(user, federatedCredentialUser),
      };
    } catch (error) {
      this.logger.error(`Error getting federated credential user by id ${id}`);
      return {
        error: new Error(error.message),
        value: null,
      };
    }
  }

  async getUserNamesByIds(
    userIds: string[]
  ): Promise<
    RepositoryResponse<
      { id: string; firstName: string; lastName: string }[],
      Error
    >
  > {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!users) {
        return {
          value: null,
          error: new Error("Users not found"),
        };
      }

      return {
        value: users,
      };
    } catch (error) {
      this.logger.error(`Error getting user names by ids ${userIds}`);
      return {
        error: new Error(error.message),
        value: null,
      };
    }
  }

  async updateUserLastSeenAt(
    userId: string,
    lastSeenAt: Date
  ): Promise<RepositoryResponse<boolean, Error>> {
    try {
      const result = await this.prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt },
      });

      if (!result) {
        return {
          value: false,
          error: new Error(
            `Failed to update last seen at for user with id ${userId}`
          ),
        };
      }

      return {
        value: true,
      };
    } catch (error) {
      this.logger.error(
        `Error updating last seen at for user with id ${userId}: ${error.message}`
      );
      return {
        value: false,
        error: new Error(
          `Error updating last seen at for user with id ${userId}: ${error.message}`
        ),
      };
    }
  }

  async lockUsersForUpdate(
    firstUserId: string,
    secondUserId: string
  ): Promise<RepositoryResponse<string[], Error>> {
    // Outside a transaction MySQL autocommits the SELECT and releases the lock at once.
    if (!this.clientProvider.inTransaction) {
      this.logger.error("lockUsersForUpdate called outside a transaction");
      return {
        error: new Error("Locking users requires an open transaction"),
        value: [],
      };
    }

    try {
      // Locks in id order, so two transactions locking the same pair can't deadlock.
      const rows = await this.prisma.$queryRawTyped(
        lockUserPairForUpdate(firstUserId, secondUserId)
      );

      return { value: rows.map(({ id }) => id) };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error locking users: ${errorMessage}`);
      return {
        error: new Error(`Error locking users: ${errorMessage}`),
        value: [],
      };
    }
  }

  async searchUsers({
    excludeUserId,
    search,
    pagination,
  }: {
    excludeUserId: string;
    search?: string;
    pagination: ICursorBasedPaginationParams;
  }): Promise<RepositoryResponse<ICursorBasedPaginationResponse<User>, Error>> {
    try {
      const { cursor, limit = PAGE_LIMIT } = pagination;
      const term = search?.trim();

      // MySQL's default collation compares case-insensitively, so `contains` matches any case.
      const users = await this.prisma.user.findMany({
        where: {
          id: { not: excludeUserId },
          isActive: true,
          ...(term && {
            OR: [
              { firstName: { contains: term } },
              { lastName: { contains: term } },
              { email: { contains: term } },
            ],
          }),
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { id: "asc" }],
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      });

      const page = users.slice(0, limit);

      return {
        value: {
          data: page.map((user) => this.toDomainFromPersistence(user)),
          nextCursor:
            users.length > limit ? page[page.length - 1].id : undefined,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error searching users: ${errorMessage}`);
      return {
        error: new Error(`Error searching users: ${errorMessage}`),
        value: { data: [], nextCursor: undefined },
      };
    }
  }
}
