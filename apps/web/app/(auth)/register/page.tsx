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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const INPUT_CLASS =
  "w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500";

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
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("US");

  // Step 3: Availability
  const [availability, setAvailability] = useState<
    { day: number; start: string; end: string }[]
  >([]);

  const updateProfile = trpc.player.updateProfile.useMutation();
  const setAvailabilityMutation = trpc.player.setAvailability.useMutation();

  const toggleDay = (day: number) => {
    setAvailability((prev) => {
      const exists = prev.find((a) => a.day === day);
      if (exists) return prev.filter((a) => a.day !== day);
      return [...prev, { day, start: "09:00", end: "12:00" }];
    });
  };

  const updateSlot = (day: number, field: "start" | "end", value: string) => {
    setAvailability((prev) =>
      prev.map((a) => (a.day === day ? { ...a, [field]: value } : a))
    );
  };

  const handleFinalSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();

      // 1. Sign up via browser client — sets session cookie automatically
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

      // 2. Update profile fields via tRPC (runs with the new session)
      await updateProfile.mutateAsync({
        skill_level: skillLevel,
        city: city || undefined,
        country,
      });

      // 3. Save availability if any slots selected
      if (availability.length > 0) {
        await setAvailabilityMutation.mutateAsync({
          slots: availability.map((a) => ({
            day_of_week: a.day,
            start_time: a.start,
            end_time: a.end,
          })),
        });
      }

      router.push("/profile?welcome=true");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Tenis</h1>
          <p className="mt-2 text-gray-600">Create your player account</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-0.5 ${step > s ? "bg-green-600" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-8">
            <span>Account</span>
            <span>Profile</span>
            <span>Availability</span>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Roger Federer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className={INPUT_CLASS}
                  placeholder="roger_federer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Your tennis profile</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Skill level</label>
                <div className="grid grid-cols-2 gap-3">
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSkillLevel(level.value)}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${
                        skillLevel === level.value
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900">{level.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
                    className={INPUT_CLASS}
                    placeholder="US"
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">When can you play?</h2>
              <p className="text-sm text-gray-500">Select your typical weekly availability so other players can find you.</p>
              <div className="space-y-3">
                {DAYS.map((day, index) => {
                  const slot = availability.find((a) => a.day === index);
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDay(index)}
                        className={`w-12 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                          slot ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {day}
                      </button>
                      {slot && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateSlot(index, "start", e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <span className="text-gray-400 text-sm">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateSlot(index, "end", e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
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

          {step === 1 && (
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-green-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
