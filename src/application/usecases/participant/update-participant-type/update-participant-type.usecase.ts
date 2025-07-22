import { UpdateParticipantTypeRequest } from "./update-participant-type.request";
import { UpdateParticipantTypeResponse } from "./update-participant-type.response";

export interface IUpdateParticipantTypeUseCase {
  execute(request: UpdateParticipantTypeRequest): Promise<UpdateParticipantTypeResponse>;
}
