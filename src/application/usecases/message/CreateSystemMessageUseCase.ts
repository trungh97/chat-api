import { generateSystemMessageInGroupConversation } from "@application/utils";
import { ICreateSystemMessageRequestDTO } from "@domain/dtos/message";
import { Message } from "@domain/entities";
import {
  IConversationRepository,
  IMessageRepository,
} from "@domain/repositories";
import { ICreateSystemMessageUseCase } from "@domain/usecases/message";
import { TYPES } from "@infrastructure/external/di/inversify";
import { MessageType } from "@prisma/client";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";
import { v4 as uuid } from "uuid";

@injectable()
export class CreateSystemMessageUseCase implements ICreateSystemMessageUseCase {
  constructor(
    @inject(TYPES.MessagePrismaRepository)
    private messageRepository: IMessageRepository,

    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    conversationId,
    systemMessageType,
    relatedUser,
  }: ICreateSystemMessageRequestDTO): Promise<UseCaseResponse<Message>> {
    try {
      const { value: conversation, error: conversationError } =
        await this.conversationRepository.getConversationById(conversationId);

      if (conversationError || !conversation.id) {
        this.logger.error(
          `Error getting conversation: ${conversationError.message}`
        );
        return { data: null, error: conversationError.message };
      }

      const systemMessage = new Message({
        id: uuid(),
        content: generateSystemMessageInGroupConversation(
          systemMessageType,
          relatedUser
        ),
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

      return { data: newSystemMessage };
    } catch (error) {
      this.logger.error(`Error creating system message: ${error}`);
      return { data: null, error: `Error creating system message: ${error}` };
    }
  }
}
