import { IConversationRepository } from "@domain/repositories";
import { IDeleteConversationUsecase } from "@domain/usecases/conversation";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class DeleteConversationUseCase implements IDeleteConversationUsecase {
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(id: string): Promise<UseCaseResponse<boolean>> {
    try {
      const result = await this.conversationRepository.deleteConversation(id);

      if (result.error) {
        this.logger.error(result.error.message);
        return {
          error: result.error.message,
          data: null,
        };
      }

      if (!result.value) {
        return {
          error: "Failed to delete conversation.",
          data: null,
        };
      }

      return {
        data: result.value,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting conversation with id ${id}: ${error.message}`
      );

      return {
        error: `Error deleting conversation with id ${id}`,
        data: null,
      };
    }
  }
}
