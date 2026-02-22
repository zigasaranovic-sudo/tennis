"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import type { SkillLevel } from "@tenis/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
];

export default function EditProfilePage() {
  const router = useRouter();
  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: currentAvailability } = trpc.player.getAvailability.useQuery(
    { player_id: profile?.id ?? "" },
    { enabled: !!profile?.id }
  );

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [homeClub, setHomeClub] = useState("");
  const [availability, setAvailability] = useState<
    { day: number; start: string; end: string }[]
  >([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setUsername(profile.username);
      setBio(profile.bio ?? "");
      setSkillLevel(profile.skill_level as SkillLevel);
      setCity(profile.city ?? "");
      setCountry(profile.country);
      setHomeClub((profile as { home_club?: string | null }).home_club ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (currentAvailability) {
      setAvailability(
        currentAvailability.map((s) => ({
          day: s.day_of_week,
          start: s.start_time,
          end: s.end_time,
        }))
      );
    }
  }, [currentAvailability]);

  const updateProfile = trpc.player.updateProfile.useMutation({
    onSuccess: () => setSaved(true),
  });

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

  const handleSave = async () => {
    setSaved(false);
    await updateProfile.mutateAsync({
      full_name: fullName,
      username,
      bio: bio || undefined,
      skill_level: skillLevel,
      city: city || undefined,
      country,
      home_club: homeClub || undefined,
    } as Parameters<typeof updateProfile.mutateAsync>[0]);
    await setAvailabilityMutation.mutateAsync({
      slots: availability.map((a) => ({
        day_of_week: a.day,
        start_time: a.start,
        end_time: a.end,
        is_recurring: true,
      })),
    });
    router.push("/profile");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Profile updated successfully!
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Tell other players about yourself..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {SKILL_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="New York"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
              maxLength={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="US"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Home Tennis Club</label>
          <input
            type="text"
            value={homeClub}
            onChange={(e) => setHomeClub(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. TC Tivoli, Central Park Tennis Club"
          />
        </div>
      </div>

      {/* Availability editor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Availability</h2>
        <div className="space-y-3">
          {DAYS.map((day, index) => {
            const slot = availability.find((a) => a.day === index);
            return (
              <div key={day} className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(index)}
                  className={`w-24 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    slot
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
                {slot && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateSlot(index, "start", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateSlot(index, "end", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending || setAvailabilityMutation.isPending}
          className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
