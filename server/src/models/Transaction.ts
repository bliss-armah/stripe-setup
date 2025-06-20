import { Schema, model, Document } from "mongoose";

export interface ITransaction extends Document {
  stripeId: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  stripeId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  customerEmail: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default model<ITransaction>("Transaction", transactionSchema);
