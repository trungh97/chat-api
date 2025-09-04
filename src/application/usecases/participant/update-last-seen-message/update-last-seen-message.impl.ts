import { IGetMessageByIdUseCase } from "@application/usecases/message";
import {
  IMessageRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { IGetParticipantsByConversationIdUseCase } from "../get-participants-by-conversation-id";
import { UpdateParticipantLastSeenMessageRequest } from "./update-last-seen-message.request";
import { UpdateParticipantLastSeenMessageResponse } from "./update-last-seen-message.response";
import { IUpdateParticipantLastSeenMessageUseCase } from "./update-last-seen-message.usecase";

@injectable()
export class UpdateParticipantLastSeenMessageUseCase
  implements IUpdateParticipantLastSeenMessageUseCase
{
  constructor(
    @inject(TYPES.ParticipantRepository)
    private participantRepository: IParticipantRepository,

    @inject(TYPES.MessageRepository)
    private messageRepository: IMessageRepository,

    @inject(TYPES.GetMessageByIdUseCase)
    private getMessageByIdUseCase: IGetMessageByIdUseCase,

    @inject(TYPES.GetParticipantsByConversationIdUseCase)
    private getParticipantsByConversationIdUseCase: IGetParticipantsByConversationIdUseCase,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    request: UpdateParticipantLastSeenMessageRequest
  ): Promise<UpdateParticipantLastSeenMessageResponse> {
    try {
      const { participantId, messageId, userId } = request;

      const { data: messageData, error: messageError } =
        await this.getMessageByIdUseCase.execute({
          id: messageId,
          userId,
        });

      if (!messageData || messageError) {
        this.logger.error(messageError);
        return {
          data: null,
          error:
            "User does not have permission to update status of this message or message does not exist.",
        };
      }

      const { data: participants, error: participantsError } =
        await this.getParticipantsByConversationIdUseCase.execute({
          conversationId: messageData.conversationId,
          currentUserId: userId,
        });

      if (participantsError || !participants) {
        this.logger.error(participantsError);
        return {
          data: null,
          error: "Error fetching participants or no participants found.",
        };
      }

      const isValidPartcipant = participants.find(
        (participant) => participant.id === participantId
      );

      if (!isValidPartcipant) {
        this.logger.error("Participant does not exist.");
        return {
          data: null,
          error: "Participant does not exist.",
        };
      }

      const { value, error } =
        await this.participantRepository.updateLastSeenMessage(
          messageId,
          participantId
        );

      if (error) {
        this.logger.error(error.message);
        return { data: null, error: error.message };
      }

      return { data: value };
    } catch (error) {
      this.logger.error(
        `[UpdateParticipantLastSeenMessageUseCase]: Error executing update last seen message use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing update last seen message use case: ${error.message}`,
      };
    }
  }
}
