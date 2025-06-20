import { Request, Response } from "express";
import stripe from "../config/stripe";
import Transaction from "../models/Transaction";

export const createCheckoutSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: req.body.priceId, // Get priceId from request body
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.CLIENT_URL || "http://localhost:3000"
      }/success`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

export const handleStripeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      // Create transaction record
      await Transaction.create({
        stripeId: session.id,
        amount: session.amount_total / 100, // Convert from cents to dollars
        currency: session.currency,
        status: "completed",
        customerEmail: session.customer_details?.email,
        metadata: session.metadata,
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook signature verification failed" });
  }
};
