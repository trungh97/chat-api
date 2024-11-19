import { OAuth2Client } from "google-auth-library";
import config from "@config/config";

const { clientId, clientSecret, callbackUrl } = config.auth.google;

export const googleOAuth2Client = new OAuth2Client(
  clientId,
  clientSecret,
  callbackUrl
);

export default googleOAuth2Client;
