"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export function NotificationBell() {
  const { data: requests } = trpc.match.getRequests.useQuery({
    type: "incoming",
    status: "pending",
    limit: 50,
  });

  const count = requests?.length ?? 0;

  return (
    <Link
      href="/matches?tab=requests"
      className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      aria-label={count > 0 ? `${count} pending match requests` : "Match requests"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
