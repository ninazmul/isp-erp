"use client";

import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CurrentMonthBadge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const now = new Date();
  const currentRealMonth = now.getMonth() + 1; // 1-12
  const currentRealYear = now.getFullYear();

  const queryMonth = searchParams.get("month");
  const queryYear = searchParams.get("year");

  const selectedMonth = queryMonth ? parseInt(queryMonth, 10) : currentRealMonth;
  const selectedYear = queryYear ? parseInt(queryYear, 10) : currentRealYear;

  const isCurrentMonthSelected =
    selectedMonth === currentRealMonth && selectedYear === currentRealYear;

  const handleMonthYearChange = (m: number, y: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", m.toString());
    params.set("year", y.toString());

    const targetPath = pathname === "/" ? "/" : "/";
    router.push(`${targetPath}?${params.toString()}`);
  };

  const handlePrevMonth = () => {
    let m = selectedMonth - 1;
    let y = selectedYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    handleMonthYearChange(m, y);
  };

  const handleNextMonth = () => {
    let m = selectedMonth + 1;
    let y = selectedYear;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    handleMonthYearChange(m, y);
  };

  const handleReset = () => {
    handleMonthYearChange(currentRealMonth, currentRealYear);
  };

  const formattedInputValue = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`;

  const handleNativeMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [yStr, mStr] = e.target.value.split("-");
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    if (y && m) {
      handleMonthYearChange(m, y);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-xl border border-white/20 text-xs font-bold text-white shadow-sm self-start md:self-auto">
      <button
        onClick={handlePrevMonth}
        title="Previous Month"
        aria-label="Previous Month"
        className="p-1 hover:bg-white/20 rounded-lg transition-colors text-purple-200 hover:text-white"
        type="button"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      <div className="relative flex items-center gap-1.5 px-1 cursor-pointer group">
        <Calendar className="w-3.5 h-3.5 text-purple-300 group-hover:text-purple-200 transition-colors" />
        <span className="text-xs font-bold whitespace-nowrap">
          {MONTHS[selectedMonth - 1]} {selectedYear}
        </span>
        <input
          type="month"
          value={formattedInputValue}
          onChange={handleNativeMonthChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          title="Select Month and Year"
        />
      </div>

      <button
        onClick={handleNextMonth}
        title="Next Month"
        aria-label="Next Month"
        className="p-1 hover:bg-white/20 rounded-lg transition-colors text-purple-200 hover:text-white"
        type="button"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {!isCurrentMonthSelected && (
        <button
          onClick={handleReset}
          title="Reset to Current Month"
          aria-label="Reset to Current Month"
          className="p-1 hover:bg-white/20 rounded-lg transition-colors text-purple-300 hover:text-white ml-0.5 border-l border-white/20 pl-1.5"
          type="button"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
