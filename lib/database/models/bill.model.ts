import { Schema, model, models } from "mongoose";

const BillSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
    remarks: { type: String },
    invoiceNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

BillSchema.index({ customer: 1, month: 1, year: 1 }, { unique: true });

const Bill = models.Bill || model("Bill", BillSchema);

export default Bill;
