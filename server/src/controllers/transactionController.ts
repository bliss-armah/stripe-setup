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
          price: req.body.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.CLIENT_URL || "http://localhost:5173"
      }/success`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/cancel`,
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

  if (!sig) {
    console.error("No stripe signature found");
    res.status(400).json({ error: "No stripe signature" });
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      try {
        // Create transaction record with better error handling
        const transaction = await Transaction.create({
          stripeId: session.id,
          amount: session.amount_total / 100,
          currency: session.currency,
          status: "completed",
          customerEmail:
            session.customer_details?.email || session.customer_email,
          metadata: session.metadata || {},
        });

        console.log("Transaction created successfully:", transaction._id);
      } catch (dbError) {
        console.error("Database error creating transaction:", dbError);
        // Still return 200 to Stripe to avoid retries, but log the error
        // You might want to implement a retry mechanism or dead letter queue here
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook signature verification failed" });
  }
};
