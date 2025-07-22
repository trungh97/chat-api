import { AddParticipantAndNotifyRequest } from "./add-participant-and-notify.request";
import { AddParticipantAndNotifyResponse } from "./add-participant-and-notify.response";

export interface IAddingParticipantAndNotifyUseCase {
  execute(request: AddParticipantAndNotifyRequest): Promise<AddParticipantAndNotifyResponse>;
}
