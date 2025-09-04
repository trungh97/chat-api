import { UpdateParticipantLastSeenMessageRequest } from "./update-last-seen-message.request";
import { UpdateParticipantLastSeenMessageResponse } from "./update-last-seen-message.response";

export interface IUpdateParticipantLastSeenMessageUseCase {
  execute(
    request: UpdateParticipantLastSeenMessageRequest
  ): Promise<UpdateParticipantLastSeenMessageResponse>;
}
