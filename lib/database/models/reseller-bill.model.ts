import { Schema, model, models } from "mongoose";

const ResellerBillSchema = new Schema(
    {
        reseller: { type: Schema.Types.ObjectId, ref: "Reseller", required: true },
        month: { type: Number, required: true, min: 1, max: 12 },
        year: { type: Number, required: true },
        amount: { type: Number, required: true },
        paidAmount: { type: Number, default: 0, min: 0 },
        dueAmount: { type: Number, default: 0, min: 0 },
        advanceAmount: { type: Number, default: 0, min: 0 },
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

// Prevent duplicate monthly bills for same reseller
ResellerBillSchema.index({ reseller: 1, month: 1, year: 1 }, { unique: true });
ResellerBillSchema.index({ year: 1, month: 1, status: 1 });
ResellerBillSchema.index({ status: 1, paymentDate: -1 });
ResellerBillSchema.index({ createdAt: -1 });

const ResellerBill = models.ResellerBill || model("ResellerBill", ResellerBillSchema);

export default ResellerBill;
