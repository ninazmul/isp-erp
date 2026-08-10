import { Schema, model, models } from "mongoose";

const ExpenseSchema = new Schema(
  {
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    expenseDate: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    reference: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

ExpenseSchema.index({ expenseDate: -1, category: 1 });
ExpenseSchema.index({ createdAt: -1 });

const Expense = models.Expense || model("Expense", ExpenseSchema);

export default Expense;
