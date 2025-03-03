import { FriendRequest } from "@domain/entities";
import { FriendRequestStatus } from "@domain/enums";
import { IFriendRequestRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import {
  FriendRequest as FriendRequestPrismaModel,
  PrismaClient,
} from "@prisma/client";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class FriendRequestPrismaRepository implements IFriendRequestRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  private toDomainFromPersistence(
    friendRequestPrismaModel: FriendRequestPrismaModel
  ): FriendRequest {
    return new FriendRequest({
      id: friendRequestPrismaModel.id,
      senderId: friendRequestPrismaModel.senderId,
      receiverId: friendRequestPrismaModel.receiverId,
      status: friendRequestPrismaModel.status as FriendRequestStatus,
    });
  }

  async createFriendRequest(
    friendRequest: FriendRequest
  ): Promise<RepositoryResponse<FriendRequest, Error>> {
    try {
      const newFriendRequest = await this.prisma.friendRequest.create({
        data: {
          id: friendRequest.id,
          senderId: friendRequest.senderId,
          receiverId: friendRequest.receiverId,
          status: friendRequest.status,
        },
      });
      return {
        value: this.toDomainFromPersistence(newFriendRequest),
      };
    } catch (e) {
      this.logger.error(`Error creating friend request: ${e.message}`);
      return {
        value: null,
        error: new Error(`Error creating friend request: ${e.message}`),
      };
    }
  }

  async changeFriendRequestStatus(
    id: string,
    status: FriendRequestStatus
  ): Promise<RepositoryResponse<FriendRequest, Error>> {
    try {
      const updatedFriendRequest = await this.prisma.friendRequest.update({
        where: { id },
        data: { status },
      });
      return {
        value: this.toDomainFromPersistence(updatedFriendRequest),
      };
    } catch (e) {
      this.logger.error(
        `Error updating friend request status with id ${id}: ${e.message}`
      );
      return {
        value: null,
        error: new Error(`Error updating friend request status with id ${id}`),
      };
    }
  }

  async deleteFriendRequest(
    id: string
  ): Promise<RepositoryResponse<boolean, Error>> {
    try {
      await this.prisma.friendRequest.delete({ where: { id } });
      return {
        value: true,
      };
    } catch (e) {
      this.logger.error(
        `Error deleting friend request with id ${id}: ${e.message}`
      );
      return {
        value: false,
        error: new Error(`Error deleting friend request with id ${id}`),
      };
    }
  }

  async getFriendRequestsByUserId(
    userId: string
  ): Promise<RepositoryResponse<FriendRequest[], Error>> {
    try {
      const friendRequests = await this.prisma.friendRequest.findMany({
        where: { senderId: userId },
      });
      return {
        value: friendRequests.map(this.toDomainFromPersistence),
      };
    } catch (e) {
      this.logger.error(
        `Error fetching friend requests by userId ${userId}: ${e.message}`
      );
      return {
        error: new Error(`Error fetching friend requests by userId ${userId}`),
        value: null,
      };
    }
  }

  async getFriendRequestById(
    id: string
  ): Promise<RepositoryResponse<FriendRequest, Error>> {
    try {
      const friendRequest = await this.prisma.friendRequest.findUnique({
        where: { id },
      });

      if (!friendRequest) {
        return {
          value: null,
          error: new Error(`Friend request with id ${id} not found`),
        };
      }
      return {
        value: this.toDomainFromPersistence(friendRequest),
      };
    } catch (e) {
      this.logger.error(
        `Error fetching friend request by id ${id}: ${e.message}`
      );
      return {
        error: new Error(`Error fetching friend request by id ${id}`),
        value: null,
      };
    }
  }

  async getFriendRequestByUsers(
    senderId: string,
    receiverId: string
  ): Promise<RepositoryResponse<FriendRequest, Error>> {
    try {
      const friendRequest = await this.prisma.friendRequest.findFirst({
        where: {
          senderId,
          receiverId,
        },
      });

      if (!friendRequest) {
        return {
          value: null,
          error: new Error(
            `Friend request with senderId ${senderId} and receiverId ${receiverId} not found`
          ),
        };
      }

      return {
        value: this.toDomainFromPersistence(friendRequest),
      };
    } catch (e) {
      this.logger.error(
        `Error fetching friend request by senderId ${senderId} and receiverId ${receiverId}: ${e.message}`
      );
      return {
        error: new Error(
          `Error fetching friend request by senderId ${senderId} and receiverId ${receiverId}`
        ),
        value: null,
      };
    }
  }

  async findDeclinedFriendRequestsOlderThan(
    days: number
  ): Promise<RepositoryResponse<FriendRequest[], Error>> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      const friendRequests = await this.prisma.friendRequest.findMany({
        where: {
          status: FriendRequestStatus.DECLINED,
          createdAt: {
            lt: dateThreshold,
          },
        },
      });

      return {
        value: friendRequests.map(this.toDomainFromPersistence),
      };
    } catch (e) {
      this.logger.error(
        `Error fetching declined friend requests older than ${days} days: ${e.message}`
      );
      return {
        error: new Error(
          `Error fetching declined friend requests older than ${days} days`
        ),
        value: null,
      };
    }
  }
}
