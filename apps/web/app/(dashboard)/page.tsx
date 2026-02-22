"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export default function HomePage() {
  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: requests } = trpc.match.getRequests.useQuery({
    type: "incoming",
    status: "pending",
  });
  const { data: upcomingMatches } = trpc.match.getMyMatches.useQuery({
    status: "accepted",
    limit: 5,
  });

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(" ")[0] ?? "Player"}
          </h1>
          <p className="text-gray-500 mt-1">
            Your ELO:{" "}
            <span className="font-semibold text-green-600">
              {profile?.elo_rating ?? 1200}
            </span>
            {profile?.elo_provisional && (
              <span className="ml-1 text-xs text-gray-400">(provisional)</span>
            )}
          </p>
        </div>
        <Link
          href="/players"
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          Find a match
        </Link>
      </div>

      {/* Pending requests */}
      {requests && requests.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Match Requests ({requests.length})
          </h2>
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
                    {(req.requester as { full_name?: string })?.full_name?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {(req.requester as { full_name?: string })?.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(req.proposed_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {req.location_city && ` · ${req.location_city}`}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {req.proposed_format?.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/matches/requests/${req.id}`}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Matches</h2>
          <Link href="/matches" className="text-sm text-green-600 font-medium hover:underline">
            View all
          </Link>
        </div>

        {upcomingMatches && upcomingMatches.length > 0 ? (
          <div className="space-y-3">
            {(upcomingMatches as unknown as Array<{
              id: string;
              player1: { full_name: string } | null;
              player2: { full_name: string } | null;
              scheduled_at: string | null;
              format: string | null;
            }>).map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-green-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎾</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        vs{" "}
                        {match.player1?.full_name === profile?.full_name
                          ? match.player2?.full_name
                          : match.player1?.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {match.scheduled_at
                          ? new Date(match.scheduled_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Time TBD"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full capitalize">
                    {match.format?.replace("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-4xl mb-4">🎾</p>
            <p className="font-medium text-gray-900">No upcoming matches</p>
            <p className="text-sm text-gray-500 mt-1">
              Find a player and send a match request to get started
            </p>
            <Link
              href="/players"
              className="mt-4 inline-block px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Find players
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
