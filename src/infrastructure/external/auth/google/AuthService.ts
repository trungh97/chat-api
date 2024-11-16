import { OAuth2Client } from "google-auth-library";
import { TokenPayloadResponse } from "./types";

export const verifyIdTokenAndGetPayload = async (
  client: OAuth2Client,
  idToken: string
): Promise<TokenPayloadResponse> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
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
