import { ICreateConversationRequestDTO } from "@domain/dtos/conversation";
import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";
import {
  ICreateConversationUsecase,
  IDeleteConversationUsecase,
  IFindConversationByIdUseCase,
  IGetAllConversationsUsecase,
} from "@domain/usecases/conversation";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import {
  NewConversationPayload,
  pubSub,
  Topic,
} from "@infrastructure/persistence/websocket/connection";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import {
  Arg,
  Ctx,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { Context } from "types";
import { ConversationDTO } from "../DTOs";
import { ConversationMapper } from "../mappers";
import { ConversationCreateMutationRequest } from "../types/conversation";
import { CursorBasedPaginationParams } from "../types/pagination";

const ConversationResponse = GlobalResponse(ConversationDTO);
const ConversationListResponse = GlobalResponse(ConversationDTO, true);
const ConversationDeleteResponse = GlobalResponse(Boolean);

@ObjectType()
class ConversationGlobalResponse extends ConversationResponse {}

@ObjectType()
class ConversationListGlobalResponse extends ConversationListResponse {}

@ObjectType()
class ConversationDeleteGlobalResponse extends ConversationDeleteResponse {}

@Resolver()
export class ConversationResolver {
  constructor(
    private getAllConversationsUseCase: IGetAllConversationsUsecase,
    private createConversationUseCase: ICreateConversationUsecase,
    private deleteConverationUseCase: IDeleteConversationUsecase,
    private findConversationByIdUseCase: IFindConversationByIdUseCase,
    private logger: ILogger
  ) {
    this.getAllConversationsUseCase =
      container.get<IGetAllConversationsUsecase>(
        TYPES.GetAllConversationsUseCase
      );
    this.createConversationUseCase = container.get<ICreateConversationUsecase>(
      TYPES.CreateConversationUseCase
    );
    this.deleteConverationUseCase = container.get<IDeleteConversationUsecase>(
      TYPES.DeleteConversationUseCase
    );
    this.findConversationByIdUseCase =
      container.get<IFindConversationByIdUseCase>(
        TYPES.FindConversationByIdUseCase
      );
    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
  }

  @Query(() => ConversationListGlobalResponse)
  async getAllConversations(
    @Arg("options", () => CursorBasedPaginationParams)
    options: ICursorBasedPaginationParams
  ): Promise<ConversationListGlobalResponse> {
    try {
      const { cursor, limit } = options;
      const result = await this.getAllConversationsUseCase.execute({
        cursor,
        limit,
      });

      const { data, error } = result;

      if (error) {
        this.logger.error(error);
        return {
          error,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Get conversations successfully!",
        data: data.data.map(ConversationMapper.toDTO),
      };
    } catch (error) {
      this.logger.error(`Error getting all conversations: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => ConversationGlobalResponse)
  async createConversation(
    @Arg("conversation", () => ConversationCreateMutationRequest)
    conversation: ICreateConversationRequestDTO,
    @Ctx() { req }: Context
  ): Promise<ConversationGlobalResponse> {
    try {
      const { participants } = conversation;

      if (!req.session.userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      const currentUser = req.session.userId;

      const result = await this.createConversationUseCase.execute(
        currentUser,
        participants,
        conversation
      );

      if (result.error) {
        this.logger.error(result.error);
        return {
          error: result.error,
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      await pubSub.publish(
        Topic.NEW_CONVERSATION,
        ConversationMapper.toDTO(result.data)
      );

      return {
        statusCode: StatusCodes.CREATED,
        message: "Conversation created successfully!",
        data: ConversationMapper.toDTO(result.data),
      };
    } catch (error) {
      this.logger.error(`Error creating conversation: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => ConversationDeleteGlobalResponse)
  async deleteConversation(
    @Arg("conversationId", () => String) conversationId: string,
    @Ctx() { req }: Context
  ): Promise<ConversationDeleteGlobalResponse> {
    try {
      if (!req.session.userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      // Check if the conversation exists
      const { data: conversation, error } =
        await this.findConversationByIdUseCase.execute(conversationId);

      if (!conversation || error) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Conversation not found",
        };
      }

      if (conversation.creatorId !== req.session.userId) {
        return {
          statusCode: StatusCodes.FORBIDDEN,
          error: "You are not allowed to delete this conversation",
        };
      }

      const result = await this.deleteConverationUseCase.execute(
        conversationId
      );

      if (result.error) {
        this.logger.error(result.error);
        return {
          error: result.error,
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Conversation deleted successfully!",
      };
    } catch (error) {
      this.logger.error(`Error deleting conversation: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Subscription(() => ConversationDTO, { topics: Topic.NEW_CONVERSATION })
  newConversationAdded(
    @Root() conversation: NewConversationPayload
  ): ConversationDTO {
    return conversation;
  }
}
