"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import type { SkillLevel, PreferredSurface } from "@tenis/types";


const PLAYING_STYLES = [
  "Aggressive baseliner",
  "All-court player",
  "Serve-and-volley",
  "Defensive baseliner",
  "Counter-puncher",
  "Big server",
  "Net rusher",
  "Moonballer",
];

const SLOVENIAN_CITIES = [
  "Ljubljana",
  "Maribor",
  "Celje",
  "Kranj",
  "Koper",
  "Novo Mesto",
  "Velenje",
  "Nova Gorica",
  "Murska Sobota",
  "Ptuj",
  "Trbovlje",
  "Kamnik",
  "Domžale",
  "Škofja Loka",
  "Postojna",
];

const COUNTRIES = [
  { code: "SI", name: "Slovenia" },
  { code: "AT", name: "Austria" },
  { code: "HR", name: "Croatia" },
  { code: "IT", name: "Italy" },
  { code: "HU", name: "Hungary" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "OTHER", name: "Other" },
];

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
];
const SURFACES: { value: PreferredSurface; label: string; color: string }[] = [
  { value: "clay", label: "Clay", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700" },
  { value: "hard", label: "Hard", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700" },
  { value: "grass", label: "Grass", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700" },
  { value: "indoor", label: "Indoor", color: "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600" },
];

/** Extract playing style from bio (first line if it starts with "Style:") */
function parseBio(rawBio: string): { playingStyle: string; bio: string } {
  const match = rawBio.match(/^Style:\s*(.+?)(?:\n|$)([\s\S]*)/);
  if (match) {
    return { playingStyle: match[1].trim(), bio: match[2].trim() };
  }
  return { playingStyle: "", bio: rawBio };
}

/** Combine playing style and bio into a single bio string */
function combineBio(playingStyle: string, bio: string): string {
  const trimmedStyle = playingStyle.trim();
  const trimmedBio = bio.trim();
  if (!trimmedStyle) return trimmedBio;
  if (!trimmedBio) return `Style: ${trimmedStyle}`;
  return `Style: ${trimmedStyle}\n${trimmedBio}`;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: clubs } = trpc.player.getClubs.useQuery();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [playingStyle, setPlayingStyle] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [homeClub, setHomeClub] = useState("");
  const [preferredSurface, setPreferredSurface] = useState<PreferredSurface[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setUsername(profile.username);
      const { playingStyle: ps, bio: cleanBio } = parseBio(profile.bio ?? "");
      setBio(cleanBio);
      setPlayingStyle(ps);
      setSkillLevel(profile.skill_level as SkillLevel);
      setCity(profile.city ?? "");
      setCountry(profile.country);
      setHomeClub((profile as { home_club?: string | null }).home_club ?? "");
      setPreferredSurface(
        ((profile as { preferred_surface?: string[] | null }).preferred_surface ?? []) as PreferredSurface[]
      );
    }
  }, [profile]);

  const updateProfile = trpc.player.updateProfile.useMutation({
    onSuccess: () => setSaved(true),
  });

  const toggleSurface = (surface: PreferredSurface) => {
    setPreferredSurface((prev) =>
      prev.includes(surface) ? prev.filter((s) => s !== surface) : [...prev, surface]
    );
  };

  const handleSave = async () => {
    setSaved(false);
    const combinedBio = combineBio(playingStyle, bio);
    await updateProfile.mutateAsync({
      full_name: fullName,
      username,
      bio: combinedBio || undefined,
      skill_level: skillLevel,
      city: city || undefined,
      country,
      home_club: homeClub || undefined,
      preferred_surface: preferredSurface.length > 0 ? preferredSurface : undefined,
    } as Parameters<typeof updateProfile.mutateAsync>[0]);
    router.push("/profile");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Edit Profile</h1>

      {saved && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-400 text-sm">
          Profile updated successfully!
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Basic Info</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={480}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Tell other players about yourself..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Playing Style
          </label>
          <select
            value={PLAYING_STYLES.includes(playingStyle) ? playingStyle : (playingStyle ? "__custom" : "")}
            onChange={(e) => {
              if (e.target.value !== "__custom") setPlayingStyle(e.target.value);
            }}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select playing style…</option>
            {PLAYING_STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Skill Level</label>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {SKILL_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select city…</option>
              {SLOVENIAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select country…</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Home Tennis Club</label>
          <select
            value={homeClub}
            onChange={(e) => setHomeClub(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select club…</option>
            {(clubs ?? []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preferred surface */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-1">Preferred Surface</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Select all surfaces you enjoy playing on.</p>
        <div className="flex flex-wrap gap-3">
          {SURFACES.map((s) => {
            const selected = preferredSurface.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSurface(s.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selected
                    ? s.color + " ring-2 ring-offset-1 ring-green-500"
                    : "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600"
                }`}
              >
                {selected && <span className="mr-1">✓</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
