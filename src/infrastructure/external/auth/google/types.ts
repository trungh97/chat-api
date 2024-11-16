import { TokenPayload } from "google-auth-library";

interface TokenPayloadResponse extends TokenPayload {
  userId: string;
}

export { TokenPayloadResponse };
