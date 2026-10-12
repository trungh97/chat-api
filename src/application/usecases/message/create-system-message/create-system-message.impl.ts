import { MessageUseCaseMapper } from "@application/usecases/dtos";
import { generateSystemMessageContent } from "@application/utils";
import { Message } from "@domain/entities";
import {
  IConversationRepository,
  IMessageRepository,
} from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { MessageType } from "@prisma/client";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { v4 as uuid } from "uuid";
import { ICreateSystemMessageRequest } from "./create-system-message.request";
import { CreateSystemMessageResponse } from "./create-system-message.response";
import { ICreateSystemMessageUseCase } from "./create-system-message.usecase";

@injectable()
export class CreateSystemMessageUseCase implements ICreateSystemMessageUseCase {
  constructor(
    @inject(TYPES.MessageRepository)
    private messageRepository: IMessageRepository,

    @inject(TYPES.ConversationRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    conversationId,
    systemMessageType,
    relatedUser,
  }: ICreateSystemMessageRequest): Promise<CreateSystemMessageResponse> {
    try {
      const {
        value: { conversation },
        error: conversationError,
      } = await this.conversationRepository.getConversationById(conversationId);

      if (conversationError || !conversation.id) {
        this.logger.error(
          `Error getting conversation: ${conversationError.message}`
        );
        return { data: null, error: conversationError.message };
      }

      const systemMessage = new Message({
        id: uuid(),
        content: generateSystemMessageContent(systemMessageType, relatedUser),
        messageType: MessageType.SYSTEM,
        senderId: null,
        conversationId,
        createdAt: new Date(),
      });

      const { value: newSystemMessage, error: newSystemMessageError } =
        await this.messageRepository.createMessage(systemMessage);

      if (newSystemMessageError) {
        this.logger.error(
          `Error creating system message: ${newSystemMessageError.message}`
        );
        return { data: null, error: newSystemMessageError.message };
      }

      return { data: MessageUseCaseMapper.toUseCaseDTO(newSystemMessage) };
    } catch (error) {
      this.logger.error(`Error creating system message: ${error}`);
      return { data: null, error: `Error creating system message: ${error}` };
    }
  }
}
