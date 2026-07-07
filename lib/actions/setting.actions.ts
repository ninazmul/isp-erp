"use server";

import { connectToDatabase } from "@/lib/database";
import Setting from "@/lib/database/models/setting.model";
import { revalidatePath } from "next/cache";

// Define types
interface SettingDoc {
  _id: string;
  companyName: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  invoicePrefix: string;
  currency: string;
}

export async function getSettings() {
  await connectToDatabase();
  let setting = await Setting.findOne<SettingDoc>();

  if (!setting) {
    setting = await Setting.create({});
  }

  return JSON.parse(JSON.stringify(setting));
}

export async function updateSettings(data: Partial<SettingDoc>) {
  await connectToDatabase();

  let setting = await Setting.findOne<SettingDoc>();

  if (!setting) {
    setting = await Setting.create(data);
  } else {
    setting = await Setting.findByIdAndUpdate<SettingDoc>(setting._id, data, {
      new: true,
    });
  }

  revalidatePath("/settings");
  return JSON.parse(JSON.stringify(setting));
}
