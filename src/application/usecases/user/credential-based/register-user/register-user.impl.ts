import { getAvatarColors } from "@application/utils";
import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import queryString from "query-string";
import { RegisterCredentialBasedUserRequest } from "./register-user.request";
import { RegisterCredentialBasedUserResponse } from "./register-user.response";
import { IRegisterCredentialBasedUserUseCase } from "./register-user.usecase";

@injectable()
export class RegisterCredentialBasedUserUseCase
  implements IRegisterCredentialBasedUserUseCase
{
  constructor(
    @inject(TYPES.UserPrismaRepository) private userRepository: IUserRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(
    request: RegisterCredentialBasedUserRequest
  ): Promise<RegisterCredentialBasedUserResponse> {
    const user = await User.create(request);

    if (!request.avatar) {
      const name = `${user.firstName} ${user.lastName}`;
      const { background, text } = getAvatarColors(name);
      const query = queryString.stringify({
        name,
        background,
        color: text,
        bold: true,
      });
      user.avatar = `https://ui-avatars.com/api/?${query}`;
    }

    const result = await this.userRepository.createCredentialBasedUser(user);
    if (result.error) {
      this.logger.error(result.error.message);
      return {
        data: null,
        error: result.error.message,
      };
    }

    return {
      data: result.value,
    };
  }
}
