import { buildConversationTitle } from "@application/utils";
import { ICreateConversationRequestDTO } from "@domain/dtos/conversation";
import { Conversation } from "@domain/entities";
import { IConversationRepository, IUserRepository } from "@domain/repositories";
import { ICreateConversationUsecase } from "@domain/usecases/conversation";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
class CreateConversationUseCase implements ICreateConversationUsecase {
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,
    @inject(TYPES.UserPrismaRepository) private userRepository: IUserRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute(
    userId: string,
    participants: string[],
    conversation: ICreateConversationRequestDTO
  ): Promise<UseCaseResponse<Conversation>> {
    try {
      // TODO: Check existence
      if (participants.length < 2) {
        return {
          data: null,
          error: "Invalid request",
        };
      }

      if (!participants.includes(userId)) {
        participants.push(userId);
      }

      const { value: userNames, error: userNamesError } =
        await this.userRepository.getUserNamesByIds(participants);

      if (userNamesError) {
        return {
          data: null,
          error: userNamesError.message,
        };
      }

      const participantsInfo = userNames.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }));

      conversation.title = buildConversationTitle(
        participantsInfo,
        userId,
        conversation.title
      );

      const conversationData = await Conversation.create(userId, conversation);
      const { value, error } =
        await this.conversationRepository.createConversation(
          conversationData,
          participants
        );

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

