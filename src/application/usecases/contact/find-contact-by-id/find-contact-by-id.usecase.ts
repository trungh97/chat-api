import { FindContactByIdResponse } from "./find-contact-by-id.response";

export interface IFindContactByIdUseCase {
  execute(id: string): Promise<FindContactByIdResponse>;
}
