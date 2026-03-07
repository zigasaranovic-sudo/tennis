"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";
import type { SkillLevel } from "@tenis/types";
import { useT } from "@/lib/i18n/context";

const SKILL_LEVEL_VALUES: SkillLevel[] = ["beginner", "intermediate", "advanced", "professional"];

const SKILL_DESCS: Record<SkillLevel, string> = {
  beginner: "NTRP 1.0–2.5",
  intermediate: "NTRP 3.0–3.5",
  advanced: "NTRP 4.0–4.5",
  professional: "NTRP 5.0+",
};

const COUNTRIES: { code: string; nameEn: string }[] = [
  { code: "SI", nameEn: "Slovenia" },
  { code: "HR", nameEn: "Croatia" },
  { code: "AT", nameEn: "Austria" },
  { code: "DE", nameEn: "Germany" },
  { code: "IT", nameEn: "Italy" },
  { code: "FR", nameEn: "France" },
  { code: "ES", nameEn: "Spain" },
  { code: "PT", nameEn: "Portugal" },
  { code: "GB", nameEn: "United Kingdom" },
  { code: "CH", nameEn: "Switzerland" },
  { code: "NL", nameEn: "Netherlands" },
  { code: "BE", nameEn: "Belgium" },
  { code: "PL", nameEn: "Poland" },
  { code: "CZ", nameEn: "Czech Republic" },
  { code: "SK", nameEn: "Slovakia" },
  { code: "HU", nameEn: "Hungary" },
  { code: "RS", nameEn: "Serbia" },
  { code: "BA", nameEn: "Bosnia and Herzegovina" },
  { code: "ME", nameEn: "Montenegro" },
  { code: "MK", nameEn: "North Macedonia" },
  { code: "AL", nameEn: "Albania" },
  { code: "BG", nameEn: "Bulgaria" },
  { code: "RO", nameEn: "Romania" },
  { code: "GR", nameEn: "Greece" },
  { code: "SE", nameEn: "Sweden" },
  { code: "NO", nameEn: "Norway" },
  { code: "DK", nameEn: "Denmark" },
  { code: "FI", nameEn: "Finland" },
  { code: "US", nameEn: "United States" },
  { code: "CA", nameEn: "Canada" },
  { code: "AU", nameEn: "Australia" },
  { code: "BR", nameEn: "Brazil" },
  { code: "AR", nameEn: "Argentina" },
  { code: "JP", nameEn: "Japan" },
  { code: "CN", nameEn: "China" },
  { code: "IN", nameEn: "India" },
  { code: "ZA", nameEn: "South Africa" },
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
  const { t } = useT();
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
        setError(t.auth.checkEmail);
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
      setError(err instanceof Error ? err.message : t.common.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Playmate</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">{t.auth.createAccountTitle}</p>

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
            <span>{t.auth.accountStep}</span>
            <span>{t.auth.profileStep}</span>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{t.auth.createAccount}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.auth.fullName}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Roger Federer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.auth.username}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className={INPUT_CLASS}
                  placeholder="roger_federer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.auth.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.auth.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder={t.auth.passwordPlaceholder}
                />
              </div>
              <button
                onClick={() => {
                  if (!fullName || !username || !email || password.length < 8) {
                    setError(t.auth.fillFields);
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                {t.auth.continueButton}
              </button>
              <p className="text-center text-sm text-gray-600 dark:text-slate-400">
                {t.auth.alreadyHaveAccount}{" "}
                <Link href="/login" className="text-green-600 font-medium hover:underline">
                  {t.auth.signInLink}
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{t.auth.yourTennisProfile}</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">{t.auth.skillLevel}</label>
                <div className="grid grid-cols-2 gap-3">
                  {SKILL_LEVEL_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSkillLevel(value)}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${
                        skillLevel === value
                          ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-slate-100">{t.skills[value]}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{SKILL_DESCS[value]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.auth.country}</label>
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
                    <option key={c.code} value={c.code}>
                      {t.countries[c.code as keyof typeof t.countries] ?? c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.auth.city}</label>
                {citiesForCountry.length > 0 ? (
                  <>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={SELECT_CLASS}
                    >
                      <option value="">{t.auth.selectCity}</option>
                      {citiesForCountry.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__custom__">{t.auth.otherCity}</option>
                    </select>
                    {city === "__custom__" && (
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className={`${INPUT_CLASS} mt-2`}
                        placeholder={t.auth.enterCity}
                      />
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className={INPUT_CLASS}
                    placeholder={t.auth.enterCity}
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {t.auth.back}
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? t.auth.creatingAccount : t.auth.createAccountButton}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
