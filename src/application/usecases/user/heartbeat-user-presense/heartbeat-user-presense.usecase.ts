import { HeartbeatUserPresenseRequest } from './heartbeat-user-presense.request';
import { HeartbeatUserPresenseResponse } from './heartbeat-user-presense.response';

export interface IHeartbeatUserPresenseUseCase {
  execute(request: HeartbeatUserPresenseRequest): Promise<HeartbeatUserPresenseResponse>;
}
