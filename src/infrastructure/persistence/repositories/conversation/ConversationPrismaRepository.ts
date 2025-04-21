import {
  Conversation as ConversationPrismaModel,
  Message as MessagePrismaModel,
  Participant as ParticipantPrismaModel,
  PrismaClient,
} from "@prisma/client";
import { inject, injectable } from "inversify";

import { ExtendedParticipant } from "@domain/dtos/participant";
import { Conversation, Message, Participant } from "@domain/entities";
import { ConversationType, MessageType } from "@domain/enums";
import {
  ICursorBasedPaginationParams,
  ICursorBasedPaginationResponse,
} from "@domain/interfaces/pagination/CursorBasedPagination";
import {
  IConversationRepository,
  IExtendedConversationRepositoryResponse,
} from "@domain/repositories";
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

  /**
   * Converts a Prisma model representation of a conversation and its related entities
   * into a domain-specific conversation response DTO.
   *
   * @param {ConversationPrismaModel} conversationPrismaModel - The Prisma model of the conversation.
   * @param {(ParticipantPrismaModel & { user: { firstName: string, lastName: string } })[]} [participantsPrismaModel] -
   *   Optional array of Prisma models of participants, including user information.
   * @param {MessagePrismaModel[]} [messagesPrismaModel] - Optional array of Prisma models of messages.
   * @returns {IExtendedConversationRepositoryResponse} The domain-specific conversation response DTO.
   */

  private toDomainFromPersistence(options: {
    conversationPrismaModel: ConversationPrismaModel;
    participantsPrismaModel?: (ParticipantPrismaModel & {
      user?: { firstName: string; lastName: string; avatar: string };
    })[];
    messagesPrismaModel?: MessagePrismaModel[];
  }): IExtendedConversationRepositoryResponse {
    const {
      conversationPrismaModel,
      participantsPrismaModel,
      messagesPrismaModel,
    } = options;
    const conversation = new Conversation({
      ...conversationPrismaModel,
      type: conversationPrismaModel.type as ConversationType,
    });

    const result: IExtendedConversationRepositoryResponse = {
      conversation,
    };

    if (participantsPrismaModel?.length > 0) {
      result.participants = (participantsPrismaModel || []).map(
        ({ type, user: { firstName, lastName, avatar }, ...participant }) => {
          const newParticipant = new Participant({
            ...participant,
            type,
          });

          if (!firstName && !lastName) {
            return newParticipant as ExtendedParticipant;
          }

          return new ExtendedParticipant(
            newParticipant,
            `${firstName} ${lastName}`,
            avatar
          );
        }
      );
    }

    if (messagesPrismaModel?.length > 0) {
      result.messages = (messagesPrismaModel || []).map(
        (message) => new Message(message)
      );
    }

    return result;
  }

  async getMyConversations(
    userId: string,
    pagination: ICursorBasedPaginationParams
  ): Promise<
    RepositoryResponse<
      ICursorBasedPaginationResponse<IExtendedConversationRepositoryResponse>,
      Error
    >
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
            .map(
              ({
                conversationParticipants: participants,
                messages,
                ...conversation
              }) =>
                this.toDomainFromPersistence({
                  conversationPrismaModel: conversation,
                  participantsPrismaModel: participants,
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
  ): Promise<
    RepositoryResponse<IExtendedConversationRepositoryResponse, Error>
  > {
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
        value: this.toDomainFromPersistence({
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
    { id, title, creatorId, isArchived, deletedAt, type }: Conversation,
    participants: Pick<Participant, "id" | "type" | "customTitle">[]
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
            value: this.toDomainFromPersistence({
              conversationPrismaModel: existingConversation,
            }).conversation,
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
        value: this.toDomainFromPersistence({
          conversationPrismaModel: newConversation,
        }).conversation,
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

      return {
        value: this.toDomainFromPersistence({
          conversationPrismaModel: updatedConversation,
        }).conversation,
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
