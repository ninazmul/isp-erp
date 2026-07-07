import { getSettings } from "@/lib/actions/setting.actions";
import SettingsClient from "./components/SettingsClient";

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsClient initialSettings={settings} />;
}
