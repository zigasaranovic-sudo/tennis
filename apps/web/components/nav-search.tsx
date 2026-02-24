"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

const SKILL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

const SKILL_COLORS: Record<string, string> = {
  beginner: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  intermediate: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  advanced: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  expert: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

interface PlayerResult {
  id: string;
  full_name: string | null;
  username: string | null;
  skill_level: string | null;
  city: string | null;
}

export function NavSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = trpc.player.searchPlayers.useQuery(
    { name: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.trim().length >= 2 }
  );

  const players = (data?.players ?? []) as unknown as PlayerResult[];

  // Open dropdown when we have a query with 2+ chars
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [debouncedQuery]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMobileExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileExpanded(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      setOpen(false);
      setMobileExpanded(false);
      setQuery("");
      setDebouncedQuery("");
      router.push(`/players/${id}`);
    },
    [router]
  );

  const displayName = (p: PlayerResult) =>
    p.full_name ?? p.username ?? "Unknown Player";

  return (
    <div ref={containerRef} className="relative">
      {/* Desktop search input */}
      <div className="hidden md:block">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players..."
          className="w-52 rounded-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 text-sm px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 transition-all"
        />
      </div>

      {/* Mobile search icon / expanded */}
      <div className="md:hidden">
        {mobileExpanded ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players..."
            autoFocus
            className="w-40 rounded-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600"
          />
        ) : (
          <button
            onClick={() => setMobileExpanded(true)}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
            aria-label="Search players"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
              Searching...
            </div>
          )}
          {!isLoading && players.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
              No players found
            </div>
          )}
          {!isLoading && players.length > 0 && (
            <ul>
              {players.map((player) => (
                <li key={player.id}>
                  <button
                    onClick={() => handleSelect(player.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    {/* Avatar circle */}
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {displayName(player)[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                        {displayName(player)}
                      </div>
                      {player.city && (
                        <div className="text-xs text-gray-500 dark:text-slate-400 truncate">
                          {player.city}
                        </div>
                      )}
                    </div>
                    {player.skill_level && (
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${SKILL_COLORS[player.skill_level] ?? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"}`}
                      >
                        {SKILL_LABELS[player.skill_level] ?? player.skill_level}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
