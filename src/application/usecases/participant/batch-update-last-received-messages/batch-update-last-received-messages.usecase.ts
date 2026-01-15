import { BatchUpdateLastReceivedMessagesRequest } from "./batch-update-last-received-messages.request";
import { BatchUpdateLastReceivedMessagesResponse } from "./batch-update-last-received-messages.response";

export interface IBatchUpdateLastReceivedMessagesUseCase {
  execute(
    request: BatchUpdateLastReceivedMessagesRequest
  ): Promise<BatchUpdateLastReceivedMessagesResponse>;
}
