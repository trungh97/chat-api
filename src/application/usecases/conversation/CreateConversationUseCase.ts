import {
  buildConversationTitle,
  guessConversationType,
} from "@application/utils";
import { ICreateConversationRequestDTO } from "@domain/dtos/conversation";
import { Conversation } from "@domain/entities";
import { ConversationType } from "@domain/enums";
import { IConversationRepository, IUserRepository } from "@domain/repositories";
import { ICreateConversationUsecase } from "@domain/usecases/conversation";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ParticipantType } from "@prisma/client";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";
import compact from "lodash/compact";
import uniq from "lodash/uniq";

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
    conversation: ICreateConversationRequestDTO
  ): Promise<UseCaseResponse<Conversation>> {
    try {
      const participants = compact(uniq(conversation.participants));
      if (!participants.includes(userId)) {
        participants.push(userId);
      }
      const conversationType = guessConversationType(participants);

      if (conversationType === null) {
        return {
          data: null,
          error: "Invalid participants.",
        };
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

      const participantsRequest = participants.map((id) => ({
        id,
        type:
          id === userId && conversationType === ConversationType.GROUP
            ? ParticipantType.ADMIN
            : ParticipantType.MEMBER,
      }));

      const conversationData = await Conversation.create(userId, conversation);
      conversationData.type = conversationType;

      const { value, error } =
        await this.conversationRepository.createConversation(
          conversationData,
          participantsRequest
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

