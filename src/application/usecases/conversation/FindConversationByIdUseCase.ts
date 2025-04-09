import { inject, injectable } from "inversify";
import { IConversationRepository } from "@domain/repositories";
import { UseCaseResponse } from "@shared/responses";
import { TYPES } from "@infrastructure/external/di/inversify";
import { Conversation, Participant } from "@domain/entities";
import { IFindConversationByIdUseCase } from "@domain/usecases/conversation";

@injectable()
class FindConversationByIdUseCase implements IFindConversationByIdUseCase {
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository
  ) {}

  async execute(
    id: string,
    userId: string
  ): Promise<
    UseCaseResponse<
      Conversation & {
        participants: Participant[];
      }
    >
  > {
    try {
      const result = await this.conversationRepository.getConversationById(id);

      if (result.error) {
        return {
          data: null,
          error: result.error.message,
        };
      }

      const isParticipant = result.value.participants.some(
        (participant) => participant.userId === userId
      );

      if (!isParticipant) {
        return {
          data: null,
          error: "You are not a participant of this conversation",
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
