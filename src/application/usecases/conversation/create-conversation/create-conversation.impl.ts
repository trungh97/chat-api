import { guessConversationType } from "@application/utils";
import { Conversation } from "@domain/entities";
import { ConversationType } from "@domain/enums";
import { IConversationRepository, IUserRepository } from "@domain/repositories";
import { IConversationTitleService } from "@domain/services";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ParticipantType } from "@prisma/client";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import compact from "lodash/compact";
import uniq from "lodash/uniq";
import { CreateConversationRequest } from "./create-conversation.request";
import { CreateConversationResponse } from "./create-conversation.response";
import { ICreateConversationUsecase } from "./create-conversation.usecase";

@injectable()
export class CreateConversationUseCase implements ICreateConversationUsecase {
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,
    @inject(TYPES.UserPrismaRepository) private userRepository: IUserRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger,
    @inject(TYPES.ConversationTitleService)
    private conversationTitleService: IConversationTitleService
  ) {}

  async execute({
    userId,
    ...conversation
  }: CreateConversationRequest): Promise<CreateConversationResponse> {
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

      const participantIdAndNames = userNames.map(
        ({ id, firstName, lastName }) => ({
          id,
          name: `${firstName} ${lastName}`,
        })
      );

      const participantsRequest = participantIdAndNames.map(({ id }) => ({
        id,
        type:
          id === userId && conversationType === ConversationType.GROUP
            ? ParticipantType.ADMIN
            : ParticipantType.MEMBER,
        customTitle:
          this.conversationTitleService.buildDefaultConversationTitle({
            currentParticipant: {
              id,
              customTitle: undefined,
            },
            participantList: participantIdAndNames,
          }),
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

      return {
        data: value,
        error: null,
      };
    } catch (error) {
      this.logger.error(`Failed to create conversation: ${error.message}`);
      return { data: null, error: "Failed to create conversation." };
    }
  }
}
