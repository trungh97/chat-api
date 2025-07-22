import { DeleteParticipantByIdRequest } from "./delete-participant-by-id.request";
import { DeleteParticipantByIdResponse } from "./delete-participant-by-id.response";

export interface IDeleteParticipantByIdUseCase {
  /**
   * Executes the delete participant by ID use case.
   *
   * @param {DeleteParticipantByIdRequest} request - The request data.
   * @returns {Promise<DeleteParticipantByIdResponse>} The response data.
   */
  execute(
    request: DeleteParticipantByIdRequest
  ): Promise<DeleteParticipantByIdResponse>;
}
