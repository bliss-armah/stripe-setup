import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in .env");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2022-11-15" as any,
});

export default stripe;
