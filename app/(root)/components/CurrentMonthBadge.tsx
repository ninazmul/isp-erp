"use client";

import { Calendar, ChevronLeft, ChevronRight, RotateCcw, Globe } from "lucide-react";
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

  const isAllTime = queryMonth === "0";
  const selectedMonth = isAllTime
    ? 0
    : queryMonth
    ? parseInt(queryMonth, 10)
    : currentRealMonth;
  const selectedYear = queryYear ? parseInt(queryYear, 10) : currentRealYear;

  const isCurrentMonthSelected =
    !isAllTime && selectedMonth === currentRealMonth && selectedYear === currentRealYear;

  const handleMonthYearChange = (m: number, y: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", m.toString());
    params.set("year", y.toString());

    const targetPath = pathname === "/" ? "/" : "/";
    router.push(`${targetPath}?${params.toString()}`);
  };

  const handleAllTime = () => {
    handleMonthYearChange(0, currentRealYear);
  };

  const handlePrevMonth = () => {
    const activeM = selectedMonth === 0 ? currentRealMonth : selectedMonth;
    const activeY = selectedYear;
    let m = activeM - 1;
    let y = activeY;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    handleMonthYearChange(m, y);
  };

  const handleNextMonth = () => {
    const activeM = selectedMonth === 0 ? currentRealMonth : selectedMonth;
    const activeY = selectedYear;
    let m = activeM + 1;
    let y = activeY;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    handleMonthYearChange(m, y);
  };

  const handleReset = () => {
    handleMonthYearChange(currentRealMonth, currentRealYear);
  };

  const formattedInputValue = `${selectedYear}-${(selectedMonth || currentRealMonth)
    .toString()
    .padStart(2, "0")}`;

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
    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-1 rounded-xl border border-white/20 text-xs font-bold text-white shadow-sm self-start md:self-auto">
      {/* Quick All Time search toggle */}
      <button
        onClick={isAllTime ? handleReset : handleAllTime}
        title={isAllTime ? "Switch to Current Month" : "Show All Time Data"}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-extrabold transition-all ${
          isAllTime
            ? "bg-purple-500 text-white shadow-xs"
            : "hover:bg-white/15 text-purple-200 hover:text-white"
        }`}
        type="button"
      >
        <Globe className="w-3 h-3" />
        <span>All</span>
      </button>

      <span className="w-px h-3.5 bg-white/20" />

      {/* Prev Month */}
      <button
        onClick={handlePrevMonth}
        title="Previous Month"
        aria-label="Previous Month"
        className="p-1 hover:bg-white/20 rounded-lg transition-colors text-purple-200 hover:text-white"
        type="button"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Calendar date picker label */}
      <div className="relative flex items-center gap-1.5 px-1 cursor-pointer group">
        <Calendar className="w-3.5 h-3.5 text-purple-300 group-hover:text-purple-200 transition-colors" />
        <span className="text-xs font-bold whitespace-nowrap">
          {isAllTime
            ? "All Time Records"
            : `${MONTHS[selectedMonth - 1]} ${selectedYear}`}
        </span>
        <input
          type="month"
          value={formattedInputValue}
          onChange={handleNativeMonthChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          title="Select Month and Year"
        />
      </div>

      {/* Next Month */}
      <button
        onClick={handleNextMonth}
        title="Next Month"
        aria-label="Next Month"
        className="p-1 hover:bg-white/20 rounded-lg transition-colors text-purple-200 hover:text-white"
        type="button"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Reset button if custom month or All Time is active */}
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
