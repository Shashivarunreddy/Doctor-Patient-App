import { Request, Response } from "express";
import * as authService from "./auth.service";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "./auth.schema";
import { z } from "zod";

/**
 * Helper: format Zod v4 errors into a readable object
 */
const formatZodErrors = (error: z.ZodError) => {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "unknown";
    formatted[key] = issue.message;
  }
  return formatted;
};

/**
 * POST /auth/register
 */
export const registerUser = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatZodErrors(parsed.error),
    });
  }

  try {
    const result = await authService.register(parsed.data);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * POST /auth/login
 */
export const loginUser = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatZodErrors(parsed.error),
    });
  }

  try {
    const result = await authService.login(parsed.data);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: result,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * POST /auth/logout
 * Requires authentication (user must be logged in)
 */
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    await authService.logout(userId);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * POST /auth/refresh-token
 */
export const refreshToken = async (req: Request, res: Response) => {
  const parsed = refreshTokenSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatZodErrors(parsed.error),
    });
  }

  try {
    const result = await authService.refreshAccessToken(parsed.data.refreshToken);
    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * GET /auth/me
 * Requires authentication
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await authService.getProfile(userId);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
