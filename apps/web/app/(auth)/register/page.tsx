"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";
import type { SkillLevel } from "@tenis/types";

const SKILL_LEVELS: { value: SkillLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "Just starting out (NTRP 1.0–2.5)" },
  { value: "intermediate", label: "Intermediate", desc: "Consistent rallies (NTRP 3.0–3.5)" },
  { value: "advanced", label: "Advanced", desc: "Competitive player (NTRP 4.0–4.5)" },
  { value: "professional", label: "Professional", desc: "Tournament level (NTRP 5.0+)" },
];

const COUNTRIES: { code: string; name: string }[] = [
  { code: "SI", name: "Slovenia" },
  { code: "HR", name: "Croatia" },
  { code: "AT", name: "Austria" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "GB", name: "United Kingdom" },
  { code: "CH", name: "Switzerland" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "SK", name: "Slovakia" },
  { code: "HU", name: "Hungary" },
  { code: "RS", name: "Serbia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "ME", name: "Montenegro" },
  { code: "MK", name: "North Macedonia" },
  { code: "AL", name: "Albania" },
  { code: "BG", name: "Bulgaria" },
  { code: "RO", name: "Romania" },
  { code: "GR", name: "Greece" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "ZA", name: "South Africa" },
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  SI: ["Ljubljana", "Maribor", "Celje", "Kranj", "Koper", "Velenje", "Novo Mesto", "Ptuj", "Nova Gorica", "Murska Sobota", "Bled", "Portorož"],
  HR: ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Pula", "Dubrovnik", "Varaždin"],
  AT: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt"],
  DE: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig"],
  IT: ["Rome", "Milan", "Naples", "Turin", "Florence", "Bologna", "Venice", "Trieste"],
  FR: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Bordeaux", "Strasbourg"],
  ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Málaga"],
  GB: ["London", "Manchester", "Birmingham", "Glasgow", "Edinburgh", "Liverpool"],
  CH: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"],
  NL: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"],
  BE: ["Brussels", "Antwerp", "Ghent", "Bruges"],
  PL: ["Warsaw", "Krakow", "Gdansk", "Wroclaw", "Poznan"],
  CZ: ["Prague", "Brno", "Ostrava", "Plzen"],
  SK: ["Bratislava", "Košice", "Prešov", "Žilina"],
  HU: ["Budapest", "Debrecen", "Miskolc", "Pécs"],
  RS: ["Belgrade", "Novi Sad", "Niš", "Kragujevac"],
  SE: ["Stockholm", "Gothenburg", "Malmö", "Uppsala"],
  NO: ["Oslo", "Bergen", "Trondheim"],
  DK: ["Copenhagen", "Aarhus", "Odense"],
  US: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
  AU: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
};

const INPUT_CLASS =
  "w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500";

const SELECT_CLASS =
  "w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  // Step 2: Profile
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");
  const [country, setCountry] = useState("SI");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");

  const updateProfile = trpc.player.updateProfile.useMutation();

  const citiesForCountry = CITIES_BY_COUNTRY[country] ?? [];
  const selectedCity = city === "__custom__" ? customCity : city;

  const handleFinalSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, username: username.toLowerCase() },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError("Check your email to confirm your account, then sign in.");
        setLoading(false);
        return;
      }

      await updateProfile.mutateAsync({
        skill_level: skillLevel,
        city: selectedCity || undefined,
        country,
      });

      router.push("/profile?welcome=true");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Tenis</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Create your player account</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div className={`w-16 h-0.5 ${step > s ? "bg-green-600" : "bg-gray-200 dark:bg-slate-700"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-2 px-12">
            <span>Account</span>
            <span>Profile</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow rounded-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Create your account</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Roger Federer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className={INPUT_CLASS}
                  placeholder="roger_federer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="At least 8 characters"
                />
              </div>
              <button
                onClick={() => {
                  if (!fullName || !username || !email || password.length < 8) {
                    setError("Please fill in all fields (password min 8 chars)");
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
              <p className="text-center text-sm text-gray-600 dark:text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-green-600 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Your tennis profile</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Skill level</label>
                <div className="grid grid-cols-2 gap-3">
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSkillLevel(level.value)}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${
                        skillLevel === level.value
                          ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-slate-100">{level.label}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity("");
                    setCustomCity("");
                  }}
                  className={SELECT_CLASS}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">City</label>
                {citiesForCountry.length > 0 ? (
                  <>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={SELECT_CLASS}
                    >
                      <option value="">Select a city</option>
                      {citiesForCountry.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__custom__">Other (type manually)</option>
                    </select>
                    {city === "__custom__" && (
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className={`${INPUT_CLASS} mt-2`}
                        placeholder="Enter your city"
                      />
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="Enter your city"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
