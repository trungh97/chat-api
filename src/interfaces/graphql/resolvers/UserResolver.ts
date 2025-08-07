import {
  ICreateUserRequestDTO,
  IGetUserByIdUsecase,
  ILoginCredentialBasedUserUseCase,
  ILoginGoogleUserUseCase,
  IRegisterCredentialBasedUserUseCase,
  LoginCredentialBasedUserRequest,
} from "@application/usecases/user";
import { container } from "@infrastructure/external/di/inversify/inversify.config";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { COOKIE_NAME } from "@shared/constants";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { Arg, Ctx, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Context } from "types";
import { UserDTO } from "../dtos";
import { UserMapper } from "../mappers/UserMapper";
import { UserCreateMutationRequest, UserLoginInput } from "../types/user";

const UserResponse = GlobalResponse(UserDTO);

@ObjectType()
class UserGlobalResponse extends UserResponse {}

@Resolver()
export class UserResolver {
  constructor(
    private registerCredentialBasedUserUsecase: IRegisterCredentialBasedUserUseCase,
    private loginGoogleUserUseCase: ILoginGoogleUserUseCase,
    private loginCredentialBasedUserUseCase: ILoginCredentialBasedUserUseCase,
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

    this.loginGoogleUserUseCase = container.get<ILoginGoogleUserUseCase>(
      TYPES.LoginGoogleUserUseCase
    );

    this.loginCredentialBasedUserUseCase =
      container.get<ILoginCredentialBasedUserUseCase>(
        TYPES.LoginCredentialBasedUserUseCase
      );

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
  async me(@Ctx() { req }: Context): Promise<UserGlobalResponse> {
    if (!req.session.userId) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "User is not authenticated",
        error: "User is not authenticated",
      };
    }

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
}
