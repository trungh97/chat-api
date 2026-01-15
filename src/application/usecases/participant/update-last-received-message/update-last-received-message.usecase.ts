import { UpdateParticipantLastReceivedMessageRequest } from "./update-last-received-message.request";
import { UpdateParticipantLastReceivedMessageResponse } from "./update-last-received-message.response";

export interface IUpdateParticipantLastReceivedMessageUseCase {
  execute(
    request: UpdateParticipantLastReceivedMessageRequest
  ): Promise<UpdateParticipantLastReceivedMessageResponse>;
}
