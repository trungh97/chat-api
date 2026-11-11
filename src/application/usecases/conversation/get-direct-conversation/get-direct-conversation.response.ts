import { UseCaseResponse } from "@shared/responses";
import { ConversationUseCaseResponse } from "../types";

/** `data` is null when the two users have no 1:1 conversation yet. */
export type GetDirectConversationResponse =
  UseCaseResponse<ConversationUseCaseResponse>;
