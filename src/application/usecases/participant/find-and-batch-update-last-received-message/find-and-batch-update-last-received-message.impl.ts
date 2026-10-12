import { IConversationRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { IBatchUpdateLastReceivedMessagesUseCase } from "../batch-update-last-received-messages";
import { FindAndBatchUpdateLastReceivedMessageRequest } from "./find-and-batch-update-last-received-message.request";
import { FindAndBatchUpdateLastReceivedMessageResponse } from "./find-and-batch-update-last-received-message.response";
import { IFindAndBatchUpdateLastReceivedMessageUseCase } from "./find-and-batch-update-last-received-message.usecase";

@injectable()
export class FindAndBatchUpdateLastReceivedMessageUseCase
  implements IFindAndBatchUpdateLastReceivedMessageUseCase
{
  constructor(
    @inject(TYPES.ConversationRepository)
    private readonly conversationRepository: IConversationRepository,

    @inject(TYPES.BatchUpdateLastReceivedMessagesUseCase)
    private readonly batchUpdateLastReceivedMessagesUseCase: IBatchUpdateLastReceivedMessagesUseCase,

    @inject(TYPES.WinstonLogger) private readonly logger: ILogger
  ) {}

  async execute(
    request: FindAndBatchUpdateLastReceivedMessageRequest
  ): Promise<FindAndBatchUpdateLastReceivedMessageResponse> {
    try {
      // Fetch all behind conversations for the user
      const behindConversationsResp =
        await this.conversationRepository.findBehindConversations(
          request.userId
        );

      if (behindConversationsResp.error || !behindConversationsResp.value) {
        return {
          data: null,
          error:
            behindConversationsResp.error?.message ||
            "Failed to fetch behind conversations",
        };
      }

      const items = behindConversationsResp.value
        .filter((conversation) => conversation.lastMessageId)
        .map((conversation) => ({
          conversationId: conversation.id,
          messageId: conversation.lastMessageId,
        }));

      // The batch use case checks ownership, updates the pointers and publishes the events.
      const batchUpdateResp =
        await this.batchUpdateLastReceivedMessagesUseCase.execute({
          userId: request.userId,
          items,
        });

      if (batchUpdateResp.error || !batchUpdateResp.data) {
        this.logger.error(
          `[FindAndBatchUpdateLastReceivedMessageUseCase]: ${batchUpdateResp.error}`
        );
        return {
          data: null,
          error: batchUpdateResp.error || "Failed to batch update",
        };
      }

      return { data: true };
    } catch (error: unknown) {
      return {
        data: null,
        error:
          (error instanceof Error && error.message) ||
          "Error in find and batch update",
      };
    }
  }
}
