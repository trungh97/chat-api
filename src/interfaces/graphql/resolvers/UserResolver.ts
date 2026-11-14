import {
  ICreateUserRequestDTO,
  IGetUserByIdUsecase,
  IHeartbeatUserPresenseUseCase,
  ILoginCredentialBasedUserUseCase,
  ILoginGoogleUserUseCase,
  IRegisterCredentialBasedUserUseCase,
  ISearchUsersUseCase,
  IUpdateUserPresenseUseCase,
  LoginCredentialBasedUserRequest,
} from "@application/usecases/user";
import { container } from "@infrastructure/external/di/inversify/inversify.config";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { Topic } from "@infrastructure/persistence/websocket/redis-pubsub";
import { COOKIE_NAME, userPresenceKey } from "@shared/constants";
import { ILogger } from "@shared/logger";
import { isAuth } from "@shared/middlewares";
import { PublishPresenseUpdatePayload } from "@domain/events";
import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";
import { CursorBasedPaginationDTO, GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { RedisClientType } from "redis";
import {
  Arg,
  Ctx,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  Subscription,
  UseMiddleware,
} from "type-graphql";
import { Context } from "types";
import { UserContactDTO, UserDTO, UserPresenceDTO } from "../dtos";
import { UserMapper } from "../mappers/UserMapper";
import { CursorBasedPaginationParams } from "../types/pagination";
import { UserCreateMutationRequest, UserLoginInput } from "../types/user";

const UserResponse = GlobalResponse(UserDTO);
const UserPresenseResponse = GlobalResponse(UserPresenceDTO);
const HeartBeatUserPresenseResponse = GlobalResponse(Boolean);

@ObjectType()
class UserGlobalResponse extends UserResponse {}

@ObjectType()
class UserPresenseGlobalResponse extends UserPresenseResponse {}

@ObjectType()
class HeartBeatUserPresenseGlobalResponse extends HeartBeatUserPresenseResponse {}

@ObjectType()
class UserContactListResponse extends CursorBasedPaginationDTO(UserContactDTO) {}

@ObjectType()
class UserContactListGlobalResponse extends GlobalResponse(
  UserContactListResponse
) {}

@Resolver()
export class UserResolver {
  constructor(
    private registerCredentialBasedUserUsecase: IRegisterCredentialBasedUserUseCase,
    private loginGoogleUserUseCase: ILoginGoogleUserUseCase,
    private loginCredentialBasedUserUseCase: ILoginCredentialBasedUserUseCase,
    private getUserByIdUseCase: IGetUserByIdUsecase,
    private updateUserPresenceUseCase: IUpdateUserPresenseUseCase,
    private heartbeatUserPresenseUseCase: IHeartbeatUserPresenseUseCase,
    private searchUsersUseCase: ISearchUsersUseCase,
    private redisClient: RedisClientType,
    private logger: ILogger
  ) {
    this.registerCredentialBasedUserUsecase =
      container.get<IRegisterCredentialBasedUserUseCase>(
        TYPES.RegisterCredentialBasedUserUseCase
      );

    this.getUserByIdUseCase = container.get<IGetUserByIdUsecase>(
      TYPES.GetUserByIdUseCase
    );

    this.loginGoogleUserUseCase = container.get<ILoginGoogleUserUseCase>(
      TYPES.LoginGoogleUserUseCase
    );

    this.loginCredentialBasedUserUseCase =
      container.get<ILoginCredentialBasedUserUseCase>(
        TYPES.LoginCredentialBasedUserUseCase
      );

    this.updateUserPresenceUseCase = container.get<IUpdateUserPresenseUseCase>(
      TYPES.UpdateUserPresenseUseCase
    );

    this.heartbeatUserPresenseUseCase =
      container.get<IHeartbeatUserPresenseUseCase>(
        TYPES.HeartbeatUserPresenseUseCase
      );

    this.searchUsersUseCase = container.get<ISearchUsersUseCase>(
      TYPES.SearchUsersUseCase
    );

    this.redisClient = container.get<RedisClientType>(TYPES.RedisClient);

    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
  }

  @Query(() => UserGlobalResponse)
  async getUserById(
    @Arg("id", () => String) id: string
  ): Promise<UserGlobalResponse> {
    try {
      const result = await this.getUserByIdUseCase.execute({ id });

      if (result.error) {
        this.logger.error(result.error);
        return {
          error: result.error,
        };
      }

      return {
        data: UserMapper.toDTO(result.data),
      };
    } catch (error) {
      this.logger.error(error.message);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => UserGlobalResponse)
  async registerCredentialBasedUser(
    @Arg("request", () => UserCreateMutationRequest)
    request: ICreateUserRequestDTO
  ): Promise<UserGlobalResponse> {
    try {
      const result = await this.registerCredentialBasedUserUsecase.execute(
        request
      );

      if (result.error) {
        this.logger.error(result.error);
        return {
          error: result.error,
        };
      }

      return {
        data: UserMapper.toDTO(result.data),
      };
    } catch (error) {
      this.logger.error(error.message);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
        data: null,
      };
    }
  }

  @Mutation(() => UserGlobalResponse)
  async googleLogin(
    @Arg("code", () => String) code: string,
    @Ctx() { req }: Context
  ): Promise<UserGlobalResponse> {
    try {
      const result = await this.loginGoogleUserUseCase.execute({ code });

      if (!result.data) {
        this.logger.error(result.error);
        return {
          error: result.error,
        };
      }

      const loggedUser = result.data;

      // Save the login user to session
      req.session.userId = loggedUser.id;

      return {
        data: UserMapper.toDTO(result.data),
      };
    } catch (error) {
      this.logger.error(error.message);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => UserGlobalResponse)
  async loginCredentialBasedUser(
    @Arg("request", () => UserLoginInput)
    request: LoginCredentialBasedUserRequest,
    @Ctx() { req }: Context
  ): Promise<UserGlobalResponse> {
    try {
      const result = await this.loginCredentialBasedUserUseCase.execute(
        request
      );

      if (result.error) {
        this.logger.error(result.error);
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: result.error,
        };
      }

      const loggedUser = result.data;

      // Save the login user to session
      req.session.userId = loggedUser.id;

      return {
        data: UserMapper.toDTO(result.data),
      };
    } catch (error) {
      this.logger.error(error.message);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Query(() => UserGlobalResponse)
  @UseMiddleware(isAuth)
  async me(@Ctx() { req }: Context): Promise<UserGlobalResponse> {
    const result = await this.getUserByIdUseCase.execute({
      id: req.session.userId,
    });

    if (result.error) {
      return {
        statusCode: StatusCodes.NOT_FOUND,
        error: result.error,
      };
    }

    return {
      statusCode: StatusCodes.OK,
      data: UserMapper.toDTO(result.data),
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve, _) => {
      res.clearCookie(COOKIE_NAME);

      req.session.destroy((error) => {
        if (error) {
          this.logger.error("Error destroy session when logging out!");
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  @Query(() => UserContactListGlobalResponse)
  @UseMiddleware(isAuth)
  async searchUsers(
    @Arg("search", () => String, { nullable: true }) search: string | undefined,
    @Arg("options", () => CursorBasedPaginationParams)
    options: ICursorBasedPaginationParams,
    @Ctx() { req }: Context
  ): Promise<UserContactListGlobalResponse> {
    const userId = req.session.userId;

    try {
      const { data, error } = await this.searchUsersUseCase.execute({
        userId,
        search,
        pagination: options,
      });

      if (error || !data) {
        const message = error ?? "Failed to search users.";
        this.logger.error(`Error searching users: ${message}`);
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          error: message,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Users fetched successfully",
        data: {
          items: data.data,
          nextCursor: data.nextCursor,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error searching users: ${message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: message,
      };
    }
  }

  @Query(() => UserPresenseGlobalResponse)
  @UseMiddleware(isAuth)
  async getUserPresence(
    @Arg("userId", () => String) userId: string
  ): Promise<UserPresenseGlobalResponse> {
    try {
      const data = await this.redisClient.hGetAll(userPresenceKey(userId));

      return {
        statusCode: StatusCodes.OK,
        message: "User presence fetched successfully",
        data: {
          userId: data.userId,
          isOnline: data.isOnline === "true",
          lastSeenAt: data.lastSeenAt ? new Date(data.lastSeenAt) : null,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error fetching user presence for userId ${userId}: ${error.message}`
      );
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: `Error fetching user presence for userId ${userId}: ${error.message}`,
      };
    }
  }

  @Mutation(() => UserPresenseGlobalResponse)
  @UseMiddleware(isAuth)
  async updateUserPresence(
    // Ignored: the user always comes from the session. Kept so older clients keep working.
    @Arg("userId", () => String, {
      nullable: true,
      deprecationReason: "Ignored. The user is taken from the session.",
    })
    _userId: string | undefined,
    @Arg("isOnline", () => Boolean) isOnline: boolean,
    @Ctx() { req }: Context
  ): Promise<UserPresenseGlobalResponse> {
    const userId = req.session.userId;
    try {
      const result = await this.updateUserPresenceUseCase.execute({
        userId,
        isOnline,
      });

      if (!result.data || result.error) {
        this.logger.error(
          `Error updating user presence: ${result.error || "Unknown error"}`
        );
        return {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          error: `Error updating user presence: ${
            result.error || "Unknown error"
          }`,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "User presence updated successfully",
      };
    } catch (error) {
      this.logger.error(
        `Error updating user presence for userId ${userId}: ${error.message}`
      );
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: `Error updating user presence for userId ${userId}: ${error.message}`,
      };
    }
  }

  @Mutation(() => HeartBeatUserPresenseGlobalResponse)
  @UseMiddleware(isAuth)
  async heartbeatUserPresence(
    // Ignored: the user always comes from the session. Kept so older clients keep working.
    @Arg("userId", () => String, {
      nullable: true,
      deprecationReason: "Ignored. The user is taken from the session.",
    })
    _userId: string | undefined,
    @Ctx() { req }: Context
  ): Promise<HeartBeatUserPresenseGlobalResponse> {
    const userId = req.session.userId;
    try {
      const result = await this.heartbeatUserPresenseUseCase.execute({
        userId,
      });

      if (!result.data || result.error) {
        this.logger.error(
          `Error updating user presence heartbeat: ${
            result.error || "Unknown error"
          }`
        );
        return {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          error: `Error updating user presence heartbeat: ${
            result.error || "Unknown error"
          }`,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "User presence heartbeat updated successfully",
        data: true,
      };
    } catch (error) {
      this.logger.error(
        `Error updating user presence for userId ${userId}: ${error.message}`
      );
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: `Error updating user presence for userId ${userId}: ${error.message}`,
      };
    }
  }

  @Subscription(() => UserPresenseGlobalResponse, {
    topics: Topic.PRESENSE_UPDATE,
  })
  userPresence(
    @Root() payload: PublishPresenseUpdatePayload
  ): UserPresenseGlobalResponse {
    // The topic carries the raw presence event; wrap it in the response shape this field declares.
    return {
      statusCode: StatusCodes.OK,
      message: "User presence updated",
      data: {
        userId: payload.userId,
        isOnline: payload.isOnline,
        // Redis pub/sub delivers the Date as an ISO string.
        lastSeenAt: new Date(payload.lastSeenAt),
      },
    };
  }
}
