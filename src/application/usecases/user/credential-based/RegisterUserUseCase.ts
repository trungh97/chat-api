import { inject, injectable } from "inversify";

import { getAvatarColors } from "@application/utils";
import { ICreateUserRequestDTO } from "@domain/dtos/user";
import { User } from "@domain/entities";
import { IUserRepository } from "@domain/repositories";
import { IRegisterCredentialBasedUserUseCase } from "@domain/usecases/user/credential-based";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import queryString from "query-string";

@injectable()
export class RegisterCredentialBasedUserUseCase
  implements IRegisterCredentialBasedUserUseCase
{
  constructor(
    @inject(TYPES.UserPrismaRepository) private userRepository: IUserRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(
    request: ICreateUserRequestDTO
  ): Promise<UseCaseResponse<User>> {
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
