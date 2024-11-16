import {
  PrismaClient,
  User as UserPrismaModel,
  CredentialBasedAuth as CredentialBasedAuthPrismaModel,
  FederatedCredential as FederatedCredentialPrismaModel,
} from "@prisma/client";
import { inject, injectable } from "inversify";

import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";

@injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

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
    credentialBasedPrismaModel?: CredentialBasedAuthPrismaModel
  ) {
    const user = {
      ...userPrismaModel,
      ...(credentialBasedPrismaModel && {
        phone: credentialBasedPrismaModel.phone,
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
          credentialBased
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

      if (!foundUser) {
        return {
          error: new Error("User not found"),
          value: null,
        };
      }

      const { federatedCredential, credentialBased } = foundUser;

      // If found, check if the user is federated credential user (login with third-party provider)
      // If not, return the credential based user
      if (!federatedCredential || !federatedCredential.provider) {
        return {
          value: this.toDomainFromPersistence(foundUser, null, credentialBased),
        };
      }

      // Else return the federated credential user
      return {
        value: this.toDomainFromPersistence(foundUser, federatedCredential),
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
}
