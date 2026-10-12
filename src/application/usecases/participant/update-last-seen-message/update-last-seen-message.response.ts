import { UseCaseResponse } from "@shared/responses";

/** `true` if the pointer moved, `false` if the user had already seen a later message. */
export type UpdateParticipantLastSeenMessageResponse = UseCaseResponse<boolean>;
