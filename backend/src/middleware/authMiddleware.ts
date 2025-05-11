// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: number;
  email: string;
}

// Custom type for requests with user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("[Auth] Received token:", token);

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      console.log("[Auth] JWT verification error:", err);
      res.status(403).json({ error: "Invalid token" });
      return;
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default authenticateToken;
