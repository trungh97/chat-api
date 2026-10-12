import { UseCaseResponse } from "@shared/responses";

/** `true` if the pointer moved, `false` if the user had already received a later message. */
export type UpdateParticipantLastReceivedMessageResponse =
  UseCaseResponse<boolean>;
