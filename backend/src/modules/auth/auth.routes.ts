import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getMe,
} from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.post("/refresh-token", asyncHandler(refreshToken));

// Protected routes (require valid access token)
router.post("/logout", authenticate, asyncHandler(logoutUser));
router.get("/me", authenticate, asyncHandler(getMe));

export default router;
