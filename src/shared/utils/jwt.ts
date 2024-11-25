import { saltRounds } from "@shared/constants";
import bcrypt from "bcrypt";

/**
 * Hash a password using bcrypt with a salt of 5 rounds
 *
 * @async
 * @param {string} password - The password to hash
 * @returns {Promise<string>} The hashed password
 */
const hashPassword = async (password: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
};

/**
 * Compare a plain text password with a hashed password
 *
 * @async
 * @param {string} password - The plain text password to compare
 * @param {string} hash - The hashed password to compare against
 * @returns {Promise<boolean>} True if the passwords match, false otherwise
 */
const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export { hashPassword, comparePassword };
