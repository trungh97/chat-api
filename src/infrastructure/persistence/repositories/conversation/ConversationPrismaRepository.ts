import {
  Conversation as ConversationPrismaModel,
  Participant as ParticipantPrismaModel,
  Message as MessagePrismaModel,
  PrismaClient,
} from "@prisma/client";
import { inject, injectable } from "inversify";

import { Conversation, Message, Participant } from "@domain/entities";
import { ConversationType, MessageType, ParticipantType } from "@domain/enums";
import {
  ICursorBasedPaginationParams,
  ICursorBasedPaginationResponse,
} from "@domain/interfaces/pagination/CursorBasedPagination";
import { IConversationRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { PAGE_LIMIT } from "@shared/constants";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";

@injectable()
class ConversationPrismaRepository implements IConversationRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  private toDomainFromPersistence(
    conversationPrismaModel: ConversationPrismaModel,
    participantsPrismaModel?: ParticipantPrismaModel[],
    messagesPrismaModel?: MessagePrismaModel[]
  ): Conversation {
    const participants = (participantsPrismaModel || []).map(
      (participant) =>
        new Participant({
          ...participant,
          type: participant.type as ParticipantType,
        })
    );

    const messages = (messagesPrismaModel || []).map(
      (message) => new Message(message)
    );

    return new Conversation({
      ...conversationPrismaModel,
      type: conversationPrismaModel.type as ConversationType,
      participants,
      messages,
    });
  }

  async getMyConversations(
    userId: string,
    pagination: ICursorBasedPaginationParams
  ): Promise<
    RepositoryResponse<ICursorBasedPaginationResponse<Conversation>, Error>
  > {
    try {
      const { cursor, limit = PAGE_LIMIT } = pagination;
      const conversations = await this.prisma.conversation.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: { conversationParticipants: { some: { userId } } },
        include: {
          messages: {
            where: { messageType: { not: MessageType.SYSTEM } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const nextCursor =
        conversations.length > limit ? conversations[limit].id : undefined;

      return {
        value: {
          data: conversations
            .slice(0, limit)
            .map((conversation) =>
              this.toDomainFromPersistence(
                conversation,
                undefined,
                conversation.messages
              )
            ),
          nextCursor,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting my conversations: ${error.message}`);
      return {
        error: new Error(`Error getting my conversations: ${error.message}`),
        value: {
          data: [],
          nextCursor: undefined,
        },
      };
    }
  }

  async getConversationById(
    id: string
  ): Promise<
    RepositoryResponse<Conversation & { participants: Participant[] }, Error>
  > {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id },
        include: {
          conversationParticipants: true,
        },
      });

      if (!conversation) {
        return {
          error: new Error("Conversation not found"),
          value: null,
        };
      }

      return {
        value: this.toDomainFromPersistence(
          conversation,
          conversation.conversationParticipants
        ),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching conversation by id ${id}: ${error.message}`
      );
      return {
        error: new Error(`Error getting conversation by id ${id}`),
        value: null,
      };
    }
  }

  async createConversation(
    { id, title, creatorId, isArchived, deletedAt, type }: Conversation,
    participants: { id: string; type: keyof typeof ParticipantType }[]
  ): Promise<RepositoryResponse<Conversation, Error>> {
    try {
      if (participants.length === 2) {
        const existingConversation = await this.prisma.conversation.findFirst({
          where: {
            conversationParticipants: {
              every: {
                userId: {
                  in: participants.map((participant) => participant.id),
                },
              },
            },
          },
        });

        if (existingConversation) {
          return {
            value: this.toDomainFromPersistence(existingConversation),
          };
        }
      }

      const newConversation = await this.prisma.conversation.create({
        data: {
          id,
          title,
          creatorId,
          isArchived,
          deletedAt,
          type,
          conversationParticipants: {
            create: participants.map(({ id, type }) => ({
              userId: id,
              type,
            })),
          },
        },
        include: {
          conversationParticipants: true,
        },
      });

      return { value: this.toDomainFromPersistence(newConversation) };
    } catch (error) {
      this.logger.error(`Error creating conversation: ${error.message}`);
      return {
        error: new Error(`Error creating conversation: ${error.message}`),
        value: null,
      };
    }
  }

  async updateConversation(
    id: string,
    { title, creatorId, isArchived, deletedAt }: Conversation
  ): Promise<RepositoryResponse<Conversation, Error>> {
    try {
      const updatedConversation = await this.prisma.conversation.update({
        where: { id },
        data: {
          title,
          creatorId,
          isArchived,
          deletedAt,
        },
      });

      return { value: this.toDomainFromPersistence(updatedConversation) };
    } catch (error) {
      this.logger.error(
        `Error updating conversation with id ${id}: ${error.message}`
      );
      return {
        error: new Error(`Error updating conversation with id ${id}`),
        value: null,
      };
    }
  }

  async deleteConversation(
    id: string
  ): Promise<RepositoryResponse<boolean, Error>> {
    try {
      await this.prisma.conversation.delete({
        where: { id },
      });

      return {
        value: true,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting conversation with id ${id}: ${error.message}`
      );
      return {
        error: new Error(`Error deleting conversation with id ${id}`),
        value: null,
      };
    }
  }
}

export { ConversationPrismaRepository };
