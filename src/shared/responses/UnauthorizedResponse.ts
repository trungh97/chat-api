import { StatusCodes } from "http-status-codes";

export const UnauthorizedResponse = {
  statusCode: StatusCodes.UNAUTHORIZED,
  message: "Unauthorized",
  data: null,
  error: "Unauthorized",
};
