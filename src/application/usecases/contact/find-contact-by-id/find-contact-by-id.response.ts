import { UseCaseResponse } from "@shared/responses";
import { Contact } from "@domain/entities";

export type FindContactByIdResponse = UseCaseResponse<Contact>;
