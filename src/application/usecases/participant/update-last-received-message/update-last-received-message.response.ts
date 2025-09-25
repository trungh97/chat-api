import { IDetailedParticipantDTO } from "@domain/dtos";
import { UseCaseResponse } from "@shared/responses";

export type UpdateParticipantLastReceivedMessageResponse =
  UseCaseResponse<IDetailedParticipantDTO>;
