import { ICreateUserRequestDTO } from "@domain/dtos/user";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { Arg, Ctx, Mutation, ObjectType, Query, Resolver } from "type-graphql";

import { IGetUserByIdUsecase } from "@domain/usecases/user";
import { Context } from "types";
import { UserDTO } from "../DTOs";
import { UserMapper } from "../mappers/UserMapper";
import { UserCreateMutationRequest } from "../types/user";
import { IRegisterCredentialBasedUserUseCase } from "@domain/usecases/user/credential-based";

const UserResponse = GlobalResponse(UserDTO);

@ObjectType()
class UserGlobalResponse extends UserResponse {}

@Resolver()
export class UserResolver {
  /**
   * The constructor of the UserResolver class.
   *
   * @param {IRegisterCredentialBasedUserUseCase} registerCredentialBasedUserUseCase - The register credential based user use case.
   * @param {IGetUserByIdUsecase} getUserByIdUseCase - The get user by id use case.
   * @param {ILogger} logger - The logger.
   */
  constructor(
    private registerCredentialBasedUserUsecase: IRegisterCredentialBasedUserUseCase,
    private getUserByIdUseCase: IGetUserByIdUsecase,
    private logger: ILogger
  ) {
    this.registerCredentialBasedUserUsecase =
      container.get<IRegisterCredentialBasedUserUseCase>(
        TYPES.RegisterCredentialBasedUserUseCase
      );

    this.getUserByIdUseCase = container.get<IGetUserByIdUsecase>(
      TYPES.GetUserByIdUseCase
    );

    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
  }

  @Query(() => UserGlobalResponse)
  async getUserById(
    @Arg("id", () => String) id: string
  ): Promise<UserGlobalResponse> {
    try {
      const result = await this.getUserByIdUseCase.execute(id);

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
    @Arg("idToken", () => String) idToken: string,
    @Ctx() { req }: Context
  ): Promise<UserGlobalResponse> {
    try {
      // TODO: verify the id token, get the payload and the user id
      // Then check the user in the database
      // If the user is not in the database, create it
      // If the user is in the database: check the federated_credentials table record
      // If the user is not in the federated_credentials table, create it
      // Then set the user in the session

      return {
        data: null,
      };
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  @Query(() => UserGlobalResponse)
  me(@Ctx() { req }: Context): UserGlobalResponse {
    if (!req.session.user.id) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "User is not authenticated",
        error: "User is not authenticated",
      };
    }

    return {
      statusCode: StatusCodes.OK,
      data: UserMapper.toDTO(req.session.user),
    };
  }
}
