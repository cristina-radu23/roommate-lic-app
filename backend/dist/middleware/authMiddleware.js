"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    console.log("[Auth] Received token:", token);
    if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("[Auth] JWT verification error:", err);
            res.status(403).json({ error: "Invalid token" });
            return;
        }
        req.user = decoded;
        next();
    });
};
exports.default = authenticateToken;
