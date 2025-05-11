// routes/cityRoutes.ts
import express from "express";
import { getCities } from "../controllers/cityController";

const router = express.Router();
router.get("/", getCities);
export default router;
