import { StatusCodes } from "http-status-codes";

const BadRequest = new Error("Bad request");
const Unauthorized = new Error("Unauthorized");
const Forbidden = new Error("Forbidden");
const NotFound = new Error("Not found");
const WrongCredentials = new Error("Wrong credentials");
const PermissionDenied = new Error("Permission denied");
const ExpiredCSRFError = new Error("Expired CSRF token");
const WrongCSRFToken = new Error("Wrong CSRF token");
const CSRFNotPresented = new Error("CSRF token not presented");
const NotRequiredFields = new Error("Not required fields");
const BadQueryParams = new Error("Bad query params");
const InternalServerError = new Error("Internal Server Error");
const RequestTimeoutError = new Error("Request Timeout");
const InvalidJWTTokenError = new Error("Invalid JWT token");
const InvalidJWTClaims = new Error("Invalid JWT claims");
const NoCookie = new Error("Not found cookie header");

interface IErrorResponse {
  status: number;
  message: string;
}

class ErrorResponse implements IErrorResponse {
  private _status: number;
  private _message: string;

  /**
   * Creates an instance of the ErrorResponse class
   * @param {number} status - The status of the error
   * @param {string} message - The error message
   */
  constructor(status: number, message: string) {
    this._status = status;
    this._message = message;
  }

  /**
   * The status of the error
   * @readonly
   * @type {number}
   */
  get status(): number {
    return this._status;
  }

  set status(status: number) {
    this._status = status;
  }

  /**
   * The error message
   * @readonly
   * @type {string}
   */
  get message(): string {
    return this._message;
  }

  set message(message: string) {
    this._message = message;
  }
}

const {
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  REQUEST_TIMEOUT,
} = StatusCodes;

const NewBadRequestError = new ErrorResponse(BAD_REQUEST, BadRequest.message);
const NewUnauthorizedError = new ErrorResponse(
  UNAUTHORIZED,
  Unauthorized.message
);
const NewForbiddenError = new ErrorResponse(FORBIDDEN, Forbidden.message);
const NewNotFoundError = new ErrorResponse(NOT_FOUND, NotFound.message);
const NewWrongCredentialsError = new ErrorResponse(
  UNAUTHORIZED,
  WrongCredentials.message
);
const NewPermissionDeniedError = new ErrorResponse(
  FORBIDDEN,
  PermissionDenied.message
);
const NewExpiredCSRFError = new ErrorResponse(
  NOT_FOUND,
  ExpiredCSRFError.message
);
const NewWrongCSRFTokenError = new ErrorResponse(
  NOT_FOUND,
  WrongCSRFToken.message
);
const NewCSRFNotPresentedError = new ErrorResponse(
  NOT_FOUND,
  CSRFNotPresented.message
);
const NewNotRequiredFieldsError = new ErrorResponse(
  NOT_FOUND,
  NotRequiredFields.message
);
const NewBadQueryParamsError = new ErrorResponse(
  NOT_FOUND,
  BadQueryParams.message
);
const NewInternalServerError = new ErrorResponse(
  INTERNAL_SERVER_ERROR,
  InternalServerError.message
);
const NewRequestTimeoutError = new ErrorResponse(
  REQUEST_TIMEOUT,
  RequestTimeoutError.message
);
const NewInvalidJWTTokenError = new ErrorResponse(
  UNAUTHORIZED,
  InvalidJWTTokenError.message
);

export const CommonMessageError = {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  WrongCredentials,
  PermissionDenied,
  ExpiredCSRFError,
  WrongCSRFToken,
  CSRFNotPresented,
  NotRequiredFields,
  BadQueryParams,
  InternalServerError,
  RequestTimeoutError,
  InvalidJWTTokenError,
  InvalidJWTClaims,
  NoCookie,
};

export {
  NewBadRequestError,
  NewUnauthorizedError,
  NewForbiddenError,
  NewNotFoundError,
  NewWrongCredentialsError,
  NewPermissionDeniedError,
  NewExpiredCSRFError,
  NewWrongCSRFTokenError,
  NewCSRFNotPresentedError,
  NewNotRequiredFieldsError,
  NewBadQueryParamsError,
  NewInternalServerError,
  NewRequestTimeoutError,
  NewInvalidJWTTokenError,
};
