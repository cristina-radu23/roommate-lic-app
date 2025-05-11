import express from "express";
import { createAccount, loginUser, getCurrentUser } from "../controllers/userController";
import authenticateToken, { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", createAccount);
router.post("/login", loginUser);
router.get("/me", authenticateToken, (req, res) => { getCurrentUser(req as AuthenticatedRequest, res); });

export default router;
