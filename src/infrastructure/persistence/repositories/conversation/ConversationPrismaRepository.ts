import { IDetailConversationRepositoryDTO } from "@domain/dtos";
import { Conversation, Participant } from "@domain/entities";
import { MessageType } from "@domain/enums";
import {
  ICursorBasedPaginationParams,
  ICursorBasedPaginationResponse,
} from "@domain/interfaces/pagination/CursorBasedPagination";
import { IConversationRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ConversationPrismaMapper } from "@infrastructure/persistence/mappers";
import { PrismaClient } from "@prisma/client";
import { PAGE_LIMIT } from "@shared/constants";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
class ConversationPrismaRepository implements IConversationRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async getMyConversations(
    userId: string,
    pagination: ICursorBasedPaginationParams
  ): Promise<
    RepositoryResponse<
      ICursorBasedPaginationResponse<IDetailConversationRepositoryDTO>,
      Error
    >
  > {
    try {
      const { cursor, limit = PAGE_LIMIT } = pagination;
      const conversations = await this.prisma.conversation.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        where: {
          conversationParticipants: { some: { userId } },
          ...(cursor && {
            lastMessageAt: { lt: new Date(cursor) },
          }),
        },
        include: {
          messages: {
            where: { messageType: { not: MessageType.SYSTEM } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          conversationParticipants: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: [{ lastMessageAt: "desc" }, { id: "desc" }],
      });

      const nextCursor =
        conversations.length > limit
          ? conversations[limit].lastMessageAt.toISOString()
          : undefined;

      return {
        value: {
          data: conversations
            .slice(0, limit)
            .map(({ conversationParticipants, messages, ...conversation }) =>
              ConversationPrismaMapper.fromPrismaToDetailConversationDTO({
                conversationPrismaModel: conversation,
                participantsPrismaModel: conversationParticipants,
                messagesPrismaModel: messages,
              })
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
  ): Promise<RepositoryResponse<IDetailConversationRepositoryDTO, Error>> {
    try {
      const conversationData = await this.prisma.conversation.findUnique({
        where: { id },
        include: {
          conversationParticipants: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!conversationData) {
        return {
          error: new Error("Conversation not found"),
          value: null,
        };
      }

      const { conversationParticipants, ...conversation } = conversationData;

      return {
        value: ConversationPrismaMapper.fromPrismaToDetailConversationDTO({
          conversationPrismaModel: conversation,
          participantsPrismaModel: conversationParticipants,
        }),
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
    payload: Conversation,
    participants: Pick<Participant, "id" | "type" | "customTitle">[]
  ): Promise<RepositoryResponse<Conversation, Error>> {
    try {
      const { id, title, creatorId, isArchived, deletedAt, type } = payload;
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
            value:
              ConversationPrismaMapper.fromPrismaModelToEntity(
                existingConversation
              ),
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
            create: participants.map(({ id, type, customTitle }) => ({
              userId: id,
              type,
              customTitle,
            })),
          },
        },
        include: {
          conversationParticipants: true,
        },
      });

      return {
        value:
          ConversationPrismaMapper.fromPrismaModelToEntity(newConversation),
      };
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
    payload: Conversation
  ): Promise<RepositoryResponse<Conversation, Error>> {
    try {
      const { title, lastMessageAt } = payload;
      const updatedConversation = await this.prisma.conversation.update({
        where: { id },
        data: {
          title,
          lastMessageAt,
        },
      });

      return {
        value:
          ConversationPrismaMapper.fromPrismaModelToEntity(updatedConversation),
      };
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
