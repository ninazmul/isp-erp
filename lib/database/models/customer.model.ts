import { Schema, model, models } from "mongoose";

const CustomerSchema = new Schema(
  {
    customerCode: { type: String, required: true, unique: true },
    username: { type: String },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    location: { type: String, required: true },
    packageName: { type: String, required: true },
    monthlyFee: { type: Number, required: true },
    connectionDate: { type: Date, required: true },
    router: { type: String },
    ipAddress: { type: String },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Disconnected"],
      default: "Active",
    },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

CustomerSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
CustomerSchema.index({ name: 1, phone: 1, customerCode: 1, username: 1 });
CustomerSchema.index({ location: 1 });

const Customer = models.Customer || model("Customer", CustomerSchema);

export default Customer;
