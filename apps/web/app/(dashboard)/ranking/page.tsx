"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export default function RankingPage() {
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
  const { data: topMovers } = trpc.ranking.getTopMovers.useQuery({ limit: 5 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rankings</h1>
        {myRank?.rank && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Your rank</p>
            <p className="text-xl font-bold text-green-600">#{myRank.rank}</p>
          </div>
        )}
      </div>

      {/* Top movers this week */}
      {topMovers && topMovers.length > 0 && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <h2 className="text-sm font-semibold text-green-800 mb-3">📈 Rising this week</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {topMovers.map((mover) => (
              <Link
                key={mover.player_id}
                href={`/players/${mover.player_id}`}
                className="flex-shrink-0 bg-white rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-green-50 transition-colors border border-green-100"
              >
                <span className="text-sm font-medium text-gray-900">
                  {(mover.player as { full_name?: string })?.full_name}
                </span>
                <span className="text-xs font-bold text-green-600">
                  +{mover.elo_delta}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          value={country}
          onChange={(e) => { setCountry(e.target.value.toUpperCase().slice(0, 2)); setOffset(0); }}
          placeholder="Country (e.g. US)"
          maxLength={2}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => { setCity(e.target.value); setOffset(0); }}
          placeholder="City filter"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Leaderboard table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ELO
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  W/L
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Matches
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaderboard?.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold ${
                        player.rank === 1
                          ? "text-yellow-500"
                          : player.rank === 2
                          ? "text-gray-400"
                          : player.rank === 3
                          ? "text-amber-600"
                          : "text-gray-600"
                      }`}
                    >
                      {player.rank === 1
                        ? "🥇"
                        : player.rank === 2
                        ? "🥈"
                        : player.rank === 3
                        ? "🥉"
                        : `#${player.rank}`}
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
                        <p className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors">
                          {player.full_name}
                          {player.elo_provisional && (
                            <span className="ml-1 text-xs text-gray-400">*</span>
                          )}
                        </p>
                        {player.city && (
                          <p className="text-xs text-gray-400">{player.city}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-gray-900">{player.elo_rating}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-sm text-gray-600">
                      {player.matches_won}W / {player.matches_lost}L
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="text-sm text-gray-500">{player.matches_played}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!leaderboard || leaderboard.length === 0) && !isFetching && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No players on the leaderboard yet.</p>
            <p className="text-sm text-gray-400 mt-1">Play at least 5 ranked matches to appear.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-3">
        {offset > 0 && (
          <button
            onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
        )}
        {leaderboard && leaderboard.length === LIMIT && (
          <button
            onClick={() => setOffset(offset + LIMIT)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
