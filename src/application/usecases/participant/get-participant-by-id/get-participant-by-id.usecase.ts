import { GetParticipantByIdRequest } from "./get-participant-by-id.request";
import { GetParticipantByIdResponse } from "./get-participant-by-id.response";

export interface IGetParticipantByIdUseCase {
  execute(request: GetParticipantByIdRequest): Promise<GetParticipantByIdResponse>;
}
