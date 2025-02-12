import { inject, injectable } from "inversify";
import { IConversationRepository } from "@domain/repositories";
import { UseCaseResponse } from "@shared/responses";
import { TYPES } from "@infrastructure/external/di/inversify";
import { Conversation } from "@domain/entities";
import { IFindConversationByIdUseCase } from "@domain/usecases/conversation";

@injectable()
class FindConversationByIdUseCase implements IFindConversationByIdUseCase {
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository
  ) {}

  async execute(id: string): Promise<UseCaseResponse<Conversation>> {
    try {
      const result = await this.conversationRepository.getConversationById(id);

      if (result.error) {
        return {
          data: null,
          error: result.error.message,
        };
      }

      return {
        data: result.value,
      };
    } catch (error) {
      return {
        data: null,
        error: `Error finding conversation with id ${id}: ${error.message}`,
      };
    }
  }
}

export { FindConversationByIdUseCase };
