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
   * Converts a user entity from the Prisma model to the domain model for a credential based user.
   *
   * @param {UserPrismaModel} userPrismaModel the user entity from the Prisma model
   * @param {CredentialBasedAuthPrismaModel} credentialBasedAuthPrismaModel the credential based auth entity from the Prisma model
   * @returns {User} the user entity in the domain model
   */
  private convertCredentialBasedUserFromPersistenceToDomain(
    userPrismaModel: UserPrismaModel,
    credentialBasedAuthPrismaModel: CredentialBasedAuthPrismaModel
  ): User {
    const user = {
      ...userPrismaModel,
      phone: credentialBasedAuthPrismaModel.phone,
    };
    return new User(user);
  }

  /**
   * Converts a user entity from the Prisma model to the domain model for a federated credential user.
   *
   * @param {UserPrismaModel} userPrismaModel the user entity from the Prisma model
   * @param {FederatedCredentialPrismaModel} federatedCredentialPrismaModel the federated credential entity from the Prisma model
   * @returns {User} the user entity in the domain model
   */
  private convertFederatedCredentialUserFromPersistenceToDomain(
    userPrismaModel: UserPrismaModel,
    federatedCredentialPrismaModel: FederatedCredentialPrismaModel
  ) {
    const user = {
      ...userPrismaModel,
      provider: federatedCredentialPrismaModel.provider,
      providerUserId: federatedCredentialPrismaModel.providerUserId,
    };
    return new User(user);
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

      const { federatedCredential, credentialBased, ...userProps } = foundUser;

      // If found, check if the user is federated credential user (login with third-party provider)
      // If not, return the credential based user
      if (!federatedCredential || !federatedCredential.provider) {
        const credentialBasedUser = new User({
          ...userProps,
          phone: credentialBased.phone,
        });

        return {
          value: credentialBasedUser,
        };
      }

      // Else return the federated credential user
      const federatedCredentialUser = new User({
        ...userProps,
        provider: federatedCredential.provider,
        providerUserId: federatedCredential.providerUserId,
      });

      return {
        value: federatedCredentialUser,
      };
    } catch (error) {}
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

      const response = this.convertCredentialBasedUserFromPersistenceToDomain(
        createdUser,
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
        value: this.convertCredentialBasedUserFromPersistenceToDomain(
          user,
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

      const response =
        this.convertFederatedCredentialUserFromPersistenceToDomain(
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
        value: this.convertFederatedCredentialUserFromPersistenceToDomain(
          user,
          federatedCredentialUser
        ),
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
