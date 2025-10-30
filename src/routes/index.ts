import { Router } from "express";
import countryRoutes from "./countryRoutes";
import * as countryController from "../controllers/countryController";

const router = Router();

// health check
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// GET /countries/status - Get total countries and last refresh timestamp
router.get("/status", countryController.getStatus);

// country routes
router.use("/countries", countryRoutes);

export default router;
