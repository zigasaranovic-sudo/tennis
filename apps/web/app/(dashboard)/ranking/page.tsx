"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

export default function RankingPage() {
  const { t } = useT();
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 50;

  const { data: leaderboard, isFetching } = trpc.ranking.getLeaderboard.useQuery({
    country: country || undefined,
    city: city || undefined,
    limit: LIMIT,
    offset,
  });

  const { data: myRank } = trpc.ranking.getPlayerRank.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t.ranking.title}</h1>
        {myRank?.rank && (
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-slate-400">{t.ranking.yourRank}</p>
            <p className="text-xl font-bold text-green-600">#{myRank.rank}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          value={country}
          onChange={(e) => { setCountry(e.target.value.toUpperCase().slice(0, 2)); setOffset(0); }}
          placeholder={t.ranking.countryPlaceholder}
          maxLength={2}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => { setCity(e.target.value); setOffset(0); }}
          placeholder={t.ranking.cityPlaceholder}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Leaderboard table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.ranking.rank}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.ranking.player}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  W/L
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  {t.ranking.matches}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {leaderboard?.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold ${
                        player.rank === 1
                          ? "text-yellow-500"
                          : player.rank === 2
                          ? "text-gray-400"
                          : player.rank === 3
                          ? "text-amber-600"
                          : "text-gray-600 dark:text-slate-400"
                      }`}
                    >
                      {player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : player.rank === 3 ? "🥉" : `#${player.rank}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/players/${player.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-sm font-semibold overflow-hidden">
                        {player.avatar_url ? (
                          <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          player.full_name[0]
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 hover:text-green-600 transition-colors">
                          {player.full_name}
                        </p>
                        {player.city && (
                          <p className="text-xs text-gray-400 dark:text-slate-600">{player.city}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      {player.matches_won}W / {player.matches_lost}L
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="text-sm text-gray-500 dark:text-slate-400">{player.matches_played}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!leaderboard || leaderboard.length === 0) && !isFetching && (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-slate-400">{t.ranking.noPlayers}</p>
            <p className="text-sm text-gray-400 dark:text-slate-600 mt-1">{t.ranking.noPlayersHint}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-3">
        {offset > 0 && (
          <button
            onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
          >
            {t.ranking.previous}
          </button>
        )}
        {leaderboard && leaderboard.length === LIMIT && (
          <button
            onClick={() => setOffset(offset + LIMIT)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
          >
            {t.ranking.next}
          </button>
        )}
      </div>
    </div>
  );
}
