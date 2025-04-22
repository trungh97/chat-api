import { ICreateConversationRequestDTO } from "@domain/dtos/conversation";
import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";
import {
  ICreateConversationUsecase,
  IDeleteConversationUsecase,
  IFindConversationByIdUseCase,
  IGetMyConversationsUsecase,
} from "@domain/usecases/conversation";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { Arg, Ctx, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Context } from "types";
import { ConversationDTO, ExtendConversationDTO } from "../DTOs";
import { ConversationMapper } from "../mappers";
import { ConversationCreateMutationRequest } from "../types/conversation";
import { CursorBasedPaginationParams } from "../types/pagination";

const ExtendConversationResponse = GlobalResponse(ExtendConversationDTO);
const ExtendConversationListResponse = GlobalResponse(
  ExtendConversationDTO,
  true
);
const ConversationResponse = GlobalResponse(ConversationDTO);
const ConversationDeleteResponse = GlobalResponse(Boolean);

@ObjectType()
class ConversationGlobalResponse extends ConversationResponse {}

@ObjectType()
class ExtendConversationGlobalResponse extends ExtendConversationResponse {}

@ObjectType()
class ExtendConversationListGlobalResponse extends ExtendConversationListResponse {}

@ObjectType()
class ConversationDeleteGlobalResponse extends ConversationDeleteResponse {}

@Resolver()
export class ConversationResolver {
  constructor(
    private getMyConversationsUseCase: IGetMyConversationsUsecase,
    private createConversationUseCase: ICreateConversationUsecase,
    private deleteConverationUseCase: IDeleteConversationUsecase,
    private findConversationByIdUseCase: IFindConversationByIdUseCase,
    private logger: ILogger
  ) {
    this.getMyConversationsUseCase = container.get<IGetMyConversationsUsecase>(
      TYPES.GetMyConversationsUseCase
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

  @Query(() => ExtendConversationListGlobalResponse)
  async getMyConversations(
    @Arg("options", () => CursorBasedPaginationParams)
    options: ICursorBasedPaginationParams,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<ExtendConversationListGlobalResponse> {
    try {
      const result = await this.getMyConversationsUseCase.execute(
        userId,
        options
      );

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
        data: data.data.map(ConversationMapper.toFullConversationDTO),
      };
    } catch (error) {
      this.logger.error(`Error getting my conversations: ${error.message}`);
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
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<ConversationGlobalResponse> {
    try {
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      const result = await this.createConversationUseCase.execute(
        userId,
        conversation
      );

      if (result.error) {
        this.logger.error(result.error);
        return {
          error: result.error,
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      return {
        statusCode: StatusCodes.CREATED,
        message: "Conversation created successfully!",
        data: ConversationMapper.toConversationDTO(result.data),
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
      const { data: conversationData, error } =
        await this.findConversationByIdUseCase.execute(
          conversationId,
          req.session.userId
        );

      if (!conversationData || error) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Conversation not found",
        };
      }

      const { conversation } = conversationData;

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

  @Query(() => ExtendConversationGlobalResponse)
  async getConversationById(
    @Arg("conversationId", () => String) conversationId: string,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<ExtendConversationGlobalResponse> {
    try {
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      const { data, error } = await this.findConversationByIdUseCase.execute(
        conversationId,
        userId
      );

      if (error) {
        this.logger.error(error);
        return {
          error,
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Get conversation successfully!",
        data: ConversationMapper.toFullConversationDTO(data),
      };
    } catch (error) {
      this.logger.error(`Error getting conversation by ID: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
