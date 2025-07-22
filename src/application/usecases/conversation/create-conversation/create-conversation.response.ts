import { UseCaseResponse } from "@shared/responses";
import { Conversation } from "@domain/entities";

export type CreateConversationResponse = UseCaseResponse<Conversation>;
