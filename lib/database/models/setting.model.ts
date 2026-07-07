import { Schema, model, models } from "mongoose";

const SettingSchema = new Schema(
  {
    companyName: { type: String, required: true, default: "ISP Company" },
    logo: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    invoicePrefix: { type: String, required: true, default: "INV" },
    currency: { type: String, required: true, default: "BDT" },
  },
  { timestamps: true }
);

const Setting = models.Setting || model("Setting", SettingSchema);

export default Setting;
