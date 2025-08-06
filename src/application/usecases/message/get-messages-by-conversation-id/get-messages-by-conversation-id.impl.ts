import {
  IMessageRepository,
  IConversationRepository,
} from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { GetMessagesByConversationIdRequest } from "./get-messages-by-conversation-id.request";
import { GetMessagesByConversationIdResponse } from "./get-messages-by-conversation-id.response";
import { MessageUseCaseMapper } from "@application/usecases/dtos";
import { PAGE_LIMIT } from "@shared/constants";

@injectable()
export class GetMessagesByConversationIdUseCase {
  constructor(
    @inject(TYPES.MessagePrismaRepository)
    private messageRepository: IMessageRepository,

    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async execute({
    conversationId,
    cursor,
    limit = PAGE_LIMIT,
  }: GetMessagesByConversationIdRequest): Promise<GetMessagesByConversationIdResponse> {
    try {
      // Check if the conversation exists
      const conversation =
        await this.conversationRepository.getConversationById(conversationId);

      if (!conversation || conversation.error || !conversation.value) {
        return {
          data: null,
          error: `Conversation with id ${conversationId} does not exist.`,
        };
      }

      const result = await this.messageRepository.getMessagesByConversationId(
        conversationId,
        cursor,
        limit
      );

      if (result.error) {
        return {
          data: null,
          error: result.error.message,
        };
      }
      
      return {
        data: {
          data: result.value.data.map(MessageUseCaseMapper.toUseCaseDTO),
          nextCursor: result.value.nextCursor,
        },
      };
    } catch (error) {
      this.logger.error(error.message);
      return {
        data: null,
        error: error.message,
      };
    }
  }
}
