import { IDetailedParticipantDTO } from "@domain/dtos";
import { UseCaseResponse } from "@shared/responses";

export type AddParticipantAndNotifyResponse = UseCaseResponse<IDetailedParticipantDTO>;
