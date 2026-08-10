import { Schema, model, models } from "mongoose";

const PackageSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    monthlyFee: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const Package = models.Package || model("Package", PackageSchema);

export default Package;
