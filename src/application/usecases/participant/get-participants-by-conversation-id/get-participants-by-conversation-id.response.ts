import { Participant } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export type GetParticipantsByConversationIdResponse = UseCaseResponse<Participant[]>;
