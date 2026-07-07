import { Schema, model, models } from "mongoose";

const ExpenseSchema = new Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Bandwidth",
        "Electricity",
        "Salary",
        "Maintenance",
        "Equipment",
        "Rent",
        "Transport",
        "Miscellaneous",
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    expenseDate: { type: Date, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const Expense = models.Expense || model("Expense", ExpenseSchema);

export default Expense;
