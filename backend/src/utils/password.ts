import bcrypt from "bcryptjs";
import { env } from "../config/env";

/**
 * Hash a plain-text password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
};

/**
 * Compare a plain-text password against a hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
