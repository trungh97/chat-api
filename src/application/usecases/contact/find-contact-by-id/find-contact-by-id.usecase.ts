import { UseCaseResponse } from "@shared/responses";
import { Contact } from "@domain/entities";

export interface IFindContactByIdUseCase {
  execute(id: string): Promise<UseCaseResponse<Contact>>;
}
