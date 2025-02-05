import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";
import { IGetAllConversationsUsecase } from "@domain/usecases/conversation";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { GlobalResponse, GlobalResponses } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { Arg, ObjectType, Query, Resolver } from "type-graphql";
import { ConversationDTO } from "../DTOs";
import { ConversationMapper } from "../mappers";
import { CursorBasedPaginationParams } from "../types/pagination";

const ConversationResponse = GlobalResponse(ConversationDTO);
const ConversationListResponse = GlobalResponses(ConversationDTO);

@ObjectType()
class ConversationGlobalResponse extends ConversationResponse {}

@ObjectType()
class ConversationListGlobalResponse extends ConversationListResponse {}

@Resolver()
export class ConversationResolver {
  constructor(
    private getAllConversationsUseCase: IGetAllConversationsUsecase,
    private logger: ILogger
  ) {
    this.getAllConversationsUseCase =
      container.get<IGetAllConversationsUsecase>(
        TYPES.GetAllConversationsUseCase
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
}
