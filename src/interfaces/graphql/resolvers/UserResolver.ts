import { ICreateUserRequestDTO } from "@domain/dtos/user";
import { IRegisterUserUseCase } from "@domain/usecases/user";
import { container, TYPES } from "@infrastructure/persistence/di/inversify";
import { ILogger } from "@infrastructure/persistence/logger";
import { GlobalResponse } from "@shared/responses";
import { Arg, Mutation, ObjectType, Resolver } from "type-graphql";
import { UserDTO } from "../DTOs";
import { UserMapper } from "../mappers/UserMapper";
import { UserCreateMutationRequest } from "../types/user";

const UserResponse = GlobalResponse(UserDTO);

@ObjectType()
class UserGlobalResponse extends UserResponse {}

@Resolver()
export class UserResolver {
  /**
   * The constructor of the UserResolver class.
   *
   * @param {IRegisterUserUseCase} registerUserUseCase - The register user use case.
   * @param {ILogger} logger - The logger.
   */
  constructor(
    private registerUserUseCase: IRegisterUserUseCase,
    private logger: ILogger
  ) {
    this.registerUserUseCase = container.get<IRegisterUserUseCase>(
      TYPES.RegisterUserUseCase
    );
    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
  }

  @Mutation(() => UserGlobalResponse)
  async registerUser(
    @Arg("request", () => UserCreateMutationRequest)
    request: ICreateUserRequestDTO
  ): Promise<UserGlobalResponse> {
    try {
      const result = await this.registerUserUseCase.execute(request);

      if (result.error) {
        this.logger.error(result.error);
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        data: UserMapper.toDTO(result.data),
      };
    } catch (error) {
      this.logger.error(error.message);
      return {
        success: false,
        statusCode: 500,
        error: error.message,
        data: null,
      };
    }
  }
}
