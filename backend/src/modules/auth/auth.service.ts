
import { hashPassword, comparePassword } from "../../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from "../../utils/jwt";
import { RegisterInput, LoginInput } from "./auth.schema";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";

/**
 * Register a new user (PATIENT or DOCTOR only — no ADMIN self-registration)
 */
export const register = async (data: RegisterInput) => {
  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw { status: 409, message: "A user with this email already exists" };
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store hashed refresh token in DB
  const hashedRefreshToken = await hashPassword(refreshToken);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Login with email and password
 */
export const login = async (data: LoginInput) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }

  // Compare password
  const isMatch = await comparePassword(data.password, user.password);
  if (!isMatch) {
    throw { status: 401, message: "Invalid email or password" };
  }

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store hashed refresh token in DB
  const hashedRefreshToken = await hashPassword(refreshToken);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Logout — clear the stored refresh token
 */
export const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};

/**
 * Refresh access token using a valid refresh token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  // Verify the refresh token
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw { status: 401, message: "Invalid or expired refresh token" };
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.refreshToken) {
    throw { status: 401, message: "Invalid refresh token — user not found or token revoked" };
  }

  // Compare the provided refresh token with the stored hash
  const isValid = await comparePassword(refreshToken, user.refreshToken);
  if (!isValid) {
    throw { status: 401, message: "Refresh token has been revoked" };
  }

  // Generate new token pair (token rotation)
  const newTokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const newAccessToken = generateAccessToken(newTokenPayload);
  const newRefreshToken = generateRefreshToken(newTokenPayload);

  // Store new hashed refresh token (invalidates the old one)
  const hashedNewRefreshToken = await hashPassword(newRefreshToken);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedNewRefreshToken },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Get current user profile
 */
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return user;
};

/**
 * Seed the single ADMIN account (call once during app startup or manually)
 */
export const seedAdmin = async () => {
  const adminExists = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (adminExists) {
    console.log("Admin user already exists, skipping seed.");
    return;
  }

  const hashedPassword = await hashPassword("Admin@1234");

  await prisma.user.create({
    data: {
      name: "Admin",
      email: env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin user seeded with email: ${env.ADMIN_EMAIL}`);
};
