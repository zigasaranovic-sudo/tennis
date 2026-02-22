"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

type Tab = "upcoming" | "requests" | "history";

type MatchItem = {
  id: string;
  player1: { id: string; full_name: string } | null;
  player2: { id: string; full_name: string } | null;
  scheduled_at: string | null;
  played_at: string | null;
  location_city: string | null;
  format: string | null;
  winner_id: string | null;
  player1_elo_delta: number | null;
  player2_elo_delta: number | null;
};

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const { data: upcoming } = trpc.match.getMyMatches.useQuery({
    status: "accepted",
    limit: 20,
  });

  const { data: pendingConfirmation } = trpc.match.getMyMatches.useQuery({
    status: "pending_confirmation",
    limit: 10,
  });

  const { data: requests } = trpc.match.getRequests.useQuery({
    type: "all",
    status: "pending",
    limit: 20,
  });

  const { data: history } = trpc.match.getMyMatches.useQuery({
    status: "completed",
    limit: 20,
  });

  const respondToRequest = trpc.match.respondToRequest.useMutation();
  const { data: profile } = trpc.player.getProfile.useQuery();

  const tabs: { key: Tab; label: string; count?: number }[] = [
    {
      key: "upcoming",
      label: "Upcoming",
      count: (upcoming?.length ?? 0) + (pendingConfirmation?.length ?? 0),
    },
    {
      key: "requests",
      label: "Requests",
      count: requests?.filter((r) => r.recipient_id === profile?.id).length,
    },
    { key: "history", label: "History" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">My Matches</h1>
        <Link
          href="/players"
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          Find a match
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.key
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count ? (
              <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Upcoming tab */}
      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {/* Pending confirmation */}
          {pendingConfirmation && pendingConfirmation.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-orange-600 mb-2">Awaiting confirmation</h2>
              {(pendingConfirmation as unknown as MatchItem[]).map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="block bg-orange-50 border border-orange-200 rounded-xl p-4 hover:bg-orange-100 transition-colors mb-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        vs{" "}
                        {match.player1?.id === profile?.id
                          ? match.player2?.full_name
                          : match.player1?.full_name}
                      </p>
                      <p className="text-sm text-orange-600 mt-0.5">Result submitted — confirm or dispute</p>
                    </div>
                    <span className="text-orange-500">›</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Confirmed upcoming matches */}
          {upcoming && upcoming.length > 0 ? (
            (upcoming as unknown as MatchItem[]).map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:border-green-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎾</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        vs{" "}
                        {match.player1?.id === profile?.id
                          ? match.player2?.full_name
                          : match.player1?.full_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {match.scheduled_at
                          ? new Date(match.scheduled_at).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Time TBD"}
                        {match.location_city && ` · ${match.location_city}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">
                    {match.format?.replace(/_/g, " ")}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            !pendingConfirmation?.length && (
              <div className="text-center py-12 bg-white dark:bg-slate-800 border border-dashed border-gray-300 dark:border-slate-600 rounded-xl">
                <p className="text-4xl mb-4">🎾</p>
                <p className="font-medium text-gray-900 dark:text-slate-100">No upcoming matches</p>
                <Link
                  href="/players"
                  className="mt-3 inline-block text-sm text-green-600 font-medium hover:underline"
                >
                  Find a player to challenge
                </Link>
              </div>
            )
          )}
        </div>
      )}

      {/* Requests tab */}
      {activeTab === "requests" && (
        <div className="space-y-3">
          {requests && requests.length > 0 ? (
            requests.map((req) => {
              const isIncoming = req.recipient_id === profile?.id;
              const otherPlayer = isIncoming ? req.requester : req.recipient;
              return (
                <div
                  key={req.id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          {isIncoming ? "Incoming" : "Sent"}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-600">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-slate-100 mt-1">
                        {(otherPlayer as { full_name?: string })?.full_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {new Date(req.proposed_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {req.location_city && ` · ${req.location_city}`}
                      </p>
                      {req.message && (
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1 italic">&ldquo;{req.message}&rdquo;</p>
                      )}
                    </div>
                    {isIncoming && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            respondToRequest.mutate({
                              request_id: req.id,
                              response: "declined",
                            })
                          }
                          className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() =>
                            respondToRequest.mutate({
                              request_id: req.id,
                              response: "accepted",
                            })
                          }
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 border border-dashed border-gray-300 dark:border-slate-600 rounded-xl">
              <p className="text-4xl mb-4">📬</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">No pending requests</p>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <div className="space-y-2">
          {history && history.length > 0 ? (
            (history as unknown as MatchItem[]).map((match) => {
              const isP1 = match.player1?.id === profile?.id;
              const opponent = isP1 ? match.player2 : match.player1;
              const won = match.winner_id === profile?.id;
              const eloDelta = isP1 ? match.player1_elo_delta : match.player2_elo_delta;
              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="flex items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        won
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {won ? "WIN" : "LOSS"}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        vs {opponent?.full_name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-600">
                        {match.played_at
                          ? new Date(match.played_at).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                  {eloDelta !== null && eloDelta !== undefined && (
                    <span
                      className={`text-sm font-semibold ${
                        eloDelta > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {eloDelta > 0 ? "+" : ""}
                      {eloDelta} ELO
                    </span>
                  )}
                </Link>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 border border-dashed border-gray-300 dark:border-slate-600 rounded-xl">
              <p className="text-4xl mb-4">📊</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">No match history yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
