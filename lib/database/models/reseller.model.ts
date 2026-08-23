import { Schema, model, models } from "mongoose";

const ResellerSchema = new Schema(
    {
        resellerCode: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        location: { type: String, required: true },
        packageDesc: { type: String }, // optional free-text package description
        monthlyFee: { type: Number, required: true, default: 0 },
        activeClients: { type: Number, default: 0, min: 0 },
        inactiveClients: { type: Number, default: 0, min: 0 },
        connectionDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
        notes: { type: String },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ResellerSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
ResellerSchema.index({ name: 1, phone: 1, resellerCode: 1 });
ResellerSchema.index({ location: 1 });

const Reseller = models.Reseller || model("Reseller", ResellerSchema);

export default Reseller;
