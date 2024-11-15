import crypto from "crypto";

/**
 * Generates a state token that is used to protect against CSRF attacks.
 *
 * @returns {string} The state token.
 */

export const generateStateToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};
