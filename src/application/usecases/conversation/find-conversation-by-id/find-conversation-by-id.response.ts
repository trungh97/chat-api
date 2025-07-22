import { UseCaseResponse } from "@shared/responses";
import { ConversationUseCaseResponse } from "../types";

export type FindConversationByIdResponse =
  UseCaseResponse<ConversationUseCaseResponse>;
