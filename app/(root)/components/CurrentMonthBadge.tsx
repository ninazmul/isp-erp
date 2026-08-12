"use client";

import { Calendar } from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function CurrentMonthBadge() {
  const now = new Date();
  const label = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold text-white shadow-sm self-start md:self-auto">
      <Calendar className="w-4 h-4 text-purple-300" />
      <span>{label}</span>
    </div>
  );
}
