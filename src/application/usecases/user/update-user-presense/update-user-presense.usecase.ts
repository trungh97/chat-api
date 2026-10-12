import { UpdateUserPresenseRequest } from './update-user-presense.request';
import { UpdateUserPresenseResponse } from './update-user-presense.response';

export interface IUpdateUserPresenseUseCase {
  execute(request: UpdateUserPresenseRequest): Promise<UpdateUserPresenseResponse>;
}
