import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.index({ type: 1, name: 1 });

const Category = models.Category || model("Category", CategorySchema);

export default Category;
