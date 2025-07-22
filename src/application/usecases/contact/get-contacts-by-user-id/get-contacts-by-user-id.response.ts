import { UseCaseResponse } from "@shared/responses";
import { IContactResponseDTO } from "../types";

export type GetContactsByUserIdResponse = UseCaseResponse<
  IContactResponseDTO[]
>;
