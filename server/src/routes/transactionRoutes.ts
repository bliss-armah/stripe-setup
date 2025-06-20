import express from "express";
import {
  createCheckoutSession,
  handleStripeWebhook,
} from "../controllers/transactionController";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;
