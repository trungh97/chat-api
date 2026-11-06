import { IConversationRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { IFindConversationByIdUseCase } from "../find-conversation-by-id";
import { GetDirectConversationRequest } from "./get-direct-conversation.request";
import { GetDirectConversationResponse } from "./get-direct-conversation.response";
import { IGetDirectConversationUseCase } from "./get-direct-conversation.usecase";

@injectable()
export class GetDirectConversationUseCase implements IGetDirectConversationUseCase {
  constructor(
    @inject(TYPES.ConversationRepository)
    private conversationRepository: IConversationRepository,
    @inject(TYPES.FindConversationByIdUseCase)
    private findConversationByIdUseCase: IFindConversationByIdUseCase,
    @inject(TYPES.WinstonLogger) private logger: ILogger,
  ) {}

  async execute({
    userId,
    otherUserId,
  }: GetDirectConversationRequest): Promise<GetDirectConversationResponse> {
    try {
      if (!otherUserId || otherUserId === userId) {
        return { data: null };
      }

      const { value: conversation, error } =
        await this.conversationRepository.findPrivateBetween(
          userId,
          otherUserId,
        );

      if (error) {
        return { data: null, error: error.message };
      }

      if (!conversation) {
        return { data: null };
      }

      // Same shape and caller-specific title as getConversationById.
      return this.findConversationByIdUseCase.execute({
        id: conversation.id,
        userId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting direct conversation: ${message}`);
      return { data: null, error: "Failed to get the direct conversation." };
    }
  }
}
