import { FindAndBatchUpdateLastReceivedMessageRequest } from './find-and-batch-update-last-received-message.request';
import { FindAndBatchUpdateLastReceivedMessageResponse } from './find-and-batch-update-last-received-message.response';

export interface IFindAndBatchUpdateLastReceivedMessageUseCase {
  execute(
    request: FindAndBatchUpdateLastReceivedMessageRequest
  ): Promise<FindAndBatchUpdateLastReceivedMessageResponse>;
}
