import { OAuth2Client } from "google-auth-library";
import { TokenPayloadResponse } from "./types";
import config from "@config/config";

export const verifyIdTokenAndGetPayload = async (
  client: OAuth2Client,
  code: string
): Promise<TokenPayloadResponse> => {
  try {
    const token = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: token.tokens.id_token,
      audience: config.auth.google.clientId,
    });

    const payload = ticket.getPayload();
    const userId = ticket.getUserId();

    return {
      userId,
      ...payload,
    };
  } catch (error) {
    throw new Error("Failed to verify Google ID token");
  }
};
