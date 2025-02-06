import { inject, injectable } from "inversify";
import { Conversation } from "@domain/entities";
import { IConversationRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { ICreateConversationUsecase } from "@domain/usecases/conversation";
import { ICreateConversationRequestDTO } from "@domain/dtos/conversation";

@injectable()
class CreateConversationUseCase implements ICreateConversationUsecase {
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(
    conversation: ICreateConversationRequestDTO
  ): Promise<UseCaseResponse<Conversation>> {
    try {
      // TODO: Check existence

      const conversationData = await Conversation.create(conversation);
      const { value, error } =
        await this.conversationRepository.createConversation(conversationData);

      if (error) {
        this.logger.error(error.message);
        return { data: null, error: error.message };
      }

      return { data: value, error: null };
    } catch (error) {
      this.logger.error(`Failed to create conversation: ${error.message}`);
      return { data: null, error: "Failed to create conversation." };
    }
  }
}

export { CreateConversationUseCase };
