import { IConversationRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { DeleteConversationResponse } from "./delete-conversation.response";
import { IDeleteConversationUsecase } from "./delete-conversation.usecase";

@injectable()
export class DeleteConversationUseCase implements IDeleteConversationUsecase {
  constructor(
    @inject(TYPES.ConversationRepository)
    private conversationRepository: IConversationRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(id: string): Promise<DeleteConversationResponse> {
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
