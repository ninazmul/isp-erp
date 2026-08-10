import { Schema, model, models } from "mongoose";

const IncomeSchema = new Schema(
  {
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    incomeDate: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    reference: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

const Income = models.Income || model("Income", IncomeSchema);

export default Income;
