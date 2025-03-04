import { FriendRequestStatus } from "@domain/enums";
import { ICreateContactUseCase } from "@domain/usecases/contact";
import {
  IChangeFriendRequestStatusUseCase,
  ICreateFriendRequestUseCase,
  IDeleteFriendRequestUseCase,
  IGetFriendRequestByIdUseCase,
  IGetFriendRequestByUsersUseCase,
  IGetFriendRequestsByUserIdUseCase,
} from "@domain/usecases/friend-request";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { Arg, Ctx, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Context } from "types";
import { FriendRequestDTO } from "../DTOs";
import { FriendRequestMapper } from "../mappers";
import { FriendRequestCreateMutationRequest } from "../types/friend-request";
import { IGetUserByIdUsecase } from "@domain/usecases/user";

const FriendRequestResponseObjectType = GlobalResponse(FriendRequestDTO);
const FriendRequestListResponseObjectType = GlobalResponse(
  FriendRequestDTO,
  true
);

@ObjectType()
class FriendRequestResponse extends FriendRequestResponseObjectType {}

@ObjectType()
class FriendRequestListResponse extends FriendRequestListResponseObjectType {}

@Resolver()
export class FriendRequestResolver {
  private createFriendRequestUseCase: ICreateFriendRequestUseCase;
  private getFriendRequestByIdUseCase: IGetFriendRequestByIdUseCase;
  private getFriendRequestByUsersUseCase: IGetFriendRequestByUsersUseCase;
  private getFriendRequestsByUserIdUseCase: IGetFriendRequestsByUserIdUseCase;
  private deleteFriendRequestUseCase: IDeleteFriendRequestUseCase;
  private changeFriendRequestStatusUseCase: IChangeFriendRequestStatusUseCase;
  private createContactUseCase: ICreateContactUseCase;
  private getUserByIdUseCase: IGetUserByIdUsecase;
  private logger: ILogger;

  constructor() {
    this.createFriendRequestUseCase =
      container.get<ICreateFriendRequestUseCase>(
        TYPES.CreateFriendRequestUseCase
      );
    this.getFriendRequestByIdUseCase =
      container.get<IGetFriendRequestByIdUseCase>(
        TYPES.GetFriendRequestByIdUseCase
      );
    this.getFriendRequestByUsersUseCase =
      container.get<IGetFriendRequestByUsersUseCase>(
        TYPES.GetFriendRequestByUsersUseCase
      );
    this.getFriendRequestsByUserIdUseCase =
      container.get<IGetFriendRequestsByUserIdUseCase>(
        TYPES.GetFriendRequestsByUserIdUseCase
      );
    this.deleteFriendRequestUseCase =
      container.get<IDeleteFriendRequestUseCase>(
        TYPES.DeleteFriendRequestUseCase
      );
    this.changeFriendRequestStatusUseCase =
      container.get<IChangeFriendRequestStatusUseCase>(
        TYPES.ChangeFriendRequestStatusUseCase
      );
    this.createContactUseCase = container.get<ICreateContactUseCase>(
      TYPES.CreateContactUseCase
    );
    this.getUserByIdUseCase = container.get<IGetUserByIdUsecase>(
      TYPES.GetUserByIdUseCase
    );
    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
  }

  @Mutation(() => FriendRequestResponse)
  async createFriendRequest(
    @Arg("request", () => FriendRequestCreateMutationRequest)
    request: { receiverId: string },
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<FriendRequestResponse> {
    try {
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      if (userId === request.receiverId) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          error: "Sender and receiver cannot be the same",
        };
      }

      // Validate receiverId
      const receiverResponse = await this.getUserByIdUseCase.execute(
        request.receiverId
      );
      if (receiverResponse.error || !receiverResponse.data.id) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Invalid request",
        };
      }

      const friendRequest = await this.createFriendRequestUseCase.execute({
        ...request,
        senderId: userId,
      });

      if (friendRequest.error || !friendRequest.value) {
        this.logger.error(
          `Error creating friend request: ${friendRequest.error}`
        );
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Failed to create new friend request",
        };
      }

      return {
        statusCode: StatusCodes.CREATED,
        message: "Friend request created successfully!",
        data: FriendRequestMapper.toDTO(friendRequest.value),
      };
    } catch (error) {
      this.logger.error(`Error creating friend request: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Query(() => FriendRequestListResponse)
  async getMyFriendRequests(
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<FriendRequestListResponse> {
    try {
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      const result = await this.getFriendRequestsByUserIdUseCase.execute(
        userId
      );

      if (result.error) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Failed to fetch the friend request list!",
        };
      }

      const { value: friendRequests } = result;

      return {
        statusCode: StatusCodes.OK,
        data: friendRequests.map(FriendRequestMapper.toDTO),
      };
    } catch (error) {
      this.logger.error(
        `Error getting friend request list of userId ${userId}: ${error.message}`
      );
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Query(() => FriendRequestResponse)
  async getFriendRequestById(
    @Arg("id", () => String) id: string,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<FriendRequestResponse> {
    try {
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      const response = await this.getFriendRequestByIdUseCase.execute(id);

      if (response.error || !response.value) {
        this.logger.error(`Error fetching friend request: ${response.error}`);
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Friend request not found",
        };
      }

      return {
        statusCode: StatusCodes.OK,
        data: FriendRequestMapper.toDTO(response.value),
      };
    } catch (error) {
      this.logger.error(`Error fetching friend request: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Query(() => FriendRequestResponse)
  async getFriendRequestByUsers(
    @Arg("senderId", () => String) senderId: string,
    @Arg("receiverId", () => String) receiverId: string,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<FriendRequestResponse> {
    try {
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      if (userId !== senderId && userId !== receiverId) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          error: "You are not allowed to fetch this friend request",
        };
      }

      const response = await this.getFriendRequestByUsersUseCase.execute(
        senderId,
        receiverId
      );

      if (response.error || !response.value) {
        this.logger.error(`Error fetching friend request: ${response.error}`);
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Friend request not found",
        };
      }

      return {
        statusCode: StatusCodes.OK,
        data: FriendRequestMapper.toDTO(response.value),
      };
    } catch (error) {
      this.logger.error(`Error fetching friend request: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => FriendRequestResponse)
  async changeFriendRequestStatus(
    @Arg("id", () => String) id: string,
    @Arg("status", () => FriendRequestStatus) status: FriendRequestStatus,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<FriendRequestResponse> {
    try {
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      const response = await this.changeFriendRequestStatusUseCase.execute(
        id,
        status,
        userId
      );
      if (response.error || !response.value) {
        this.logger.error(
          `Error changing friend request status: ${response.error}`
        );
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Failed to change friend request status",
        };
      }

      // If status is ACCEPTED, add new contact
      if (status === FriendRequestStatus.ACCEPTED) {
        const friendRequest = response.value;
        const contactResponse = await this.createContactUseCase.execute({
          userId: friendRequest.senderId,
          contactId: friendRequest.receiverId,
        });

        if (contactResponse.error) {
          this.logger.error(`Error creating contact: ${contactResponse.error}`);
          return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            error: "Failed to create contact",
          };
        }
      }

      return {
        statusCode: StatusCodes.OK,
        message: "New friend added!",
        data: FriendRequestMapper.toDTO(response.value),
      };
    } catch (error) {
      this.logger.error(
        `Error changing friend request status: ${error.message}`
      );
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => Boolean)
  async deleteFriendRequest(
    @Arg("id", () => String) id: string,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<boolean> {
    try {
      if (!userId) {
        return false;
      }

      const friendRequest = await this.getFriendRequestByIdUseCase.execute(id);

      if (friendRequest.value.senderId !== userId) {
        return false;
      }

      const response = await this.deleteFriendRequestUseCase.execute(id);

      if (response.error) {
        this.logger.error(`Error deleting friend request: ${response.error}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error deleting friend request: ${error.message}`);
      return false;
    }
  }
}
