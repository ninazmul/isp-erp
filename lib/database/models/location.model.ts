import { Schema, model, models } from "mongoose";

const LocationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

LocationSchema.index({ name: 1 });

const Location = models.Location || model("Location", LocationSchema);

export default Location;
