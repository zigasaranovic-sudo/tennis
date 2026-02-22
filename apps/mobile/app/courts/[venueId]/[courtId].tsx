import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07–20

function fmtHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function toISO(date: string, hour: number) {
  return `${date}T${fmtHour(hour)}:00:00`;
}

function getDateStr(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function CourtBookingScreen() {
  const { venueId, courtId } = useLocalSearchParams<{ venueId: string; courtId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [dayOffset, setDayOffset] = useState(0);
  const date = getDateStr(dayOffset);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const { data: venue } = trpc.courts.getVenue.useQuery({ id: venueId });
  const court = venue?.courts.find((c) => c.id === courtId);
  const { data: bookings, refetch } = trpc.courts.getCourtAvailability.useQuery(
    { court_id: courtId, date },
    { enabled: !!courtId && !!date }
  );
  const bookCourt = trpc.courts.bookCourt.useMutation();

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const inputBg = isDark ? "#0f172a" : "#f9fafb";
  const inputText = isDark ? "#f1f5f9" : "#111827";
  const placeholder = isDark ? "#64748b" : "#9ca3af";

  const isBooked = (hour: number) => {
    if (!bookings) return false;
    return bookings.some((b) => {
      const start = new Date(b.starts_at).getHours();
      const end = new Date(b.ends_at).getHours();
      return hour >= start && hour < end;
    });
  };

  const handleSlotPress = (hour: number) => {
    if (isBooked(hour)) return;
    if (startHour === null) {
      setStartHour(hour);
      setEndHour(null);
    } else if (endHour === null && hour > startHour) {
      const hasConflict = Array.from({ length: hour - startHour }, (_, i) => startHour + i).some(isBooked);
      if (hasConflict) {
        Alert.alert("Conflict", "Your selection overlaps a booked slot");
        return;
      }
      setEndHour(hour);
    } else {
      setStartHour(hour);
      setEndHour(null);
    }
  };

  const handleBook = async () => {
    if (!startHour || !endHour) return;
    try {
      await bookCourt.mutateAsync({
        court_id: courtId,
        starts_at: toISO(date, startHour),
        ends_at: toISO(date, endHour),
        notes: notes || undefined,
      });
      refetch();
      setStartHour(null);
      setEndHour(null);
      setNotes("");
      Alert.alert("Booked! ✅", "Your court is reserved.", [
        { text: "View bookings", onPress: () => router.push("/courts/bookings" as never) },
        { text: "OK" },
      ]);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Booking failed");
    }
  };

  const displayDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric"
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Court info */}
      {court && (
        <View style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: border, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: textPrimary }}>{court.name}</Text>
          <Text style={{ color: textSecondary, fontSize: 13, marginTop: 2, textTransform: "capitalize" }}>
            {court.surface} · {court.is_indoor ? "Indoor" : "Outdoor"}
          </Text>
          {court.price_per_hour != null && (
            <Text style={{ color: "#16a34a", fontWeight: "700", fontSize: 15, marginTop: 6 }}>
              €{(court.price_per_hour / 100).toFixed(2)}/hr
            </Text>
          )}
        </View>
      )}

      {/* Date selector */}
      <View style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: border, padding: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: textSecondary, marginBottom: 10 }}>Select Date</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => { if (dayOffset > 0) { setDayOffset(d => d - 1); setStartHour(null); setEndHour(null); } }}
            disabled={dayOffset === 0}
            style={{ padding: 8, opacity: dayOffset === 0 ? 0.3 : 1 }}
          >
            <Text style={{ fontSize: 20, color: textPrimary }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 15, fontWeight: "600", color: textPrimary }}>{displayDate}</Text>
          <TouchableOpacity
            onPress={() => { setDayOffset(d => d + 1); setStartHour(null); setEndHour(null); }}
            style={{ padding: 8 }}
          >
            <Text style={{ fontSize: 20, color: textPrimary }}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time slots */}
      <View style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: border, padding: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: textSecondary, marginBottom: 10 }}>
          Tap start time, then end time
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {HOURS.map((h) => {
            const booked = isBooked(h);
            const isStart = startHour === h;
            const isEnd = endHour === h;
            const inRange = startHour !== null && endHour !== null && h > startHour && h < endHour;
            const selected = isStart || isEnd || inRange;

            return (
              <TouchableOpacity
                key={h}
                onPress={() => handleSlotPress(h)}
                disabled={booked}
                style={{
                  width: "21.5%",
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: booked
                    ? isDark ? "#334155" : "#f3f4f6"
                    : selected
                    ? "#16a34a"
                    : cardBg,
                  borderWidth: booked ? 0 : 1,
                  borderColor: selected ? "#16a34a" : border,
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: booked
                    ? textSecondary
                    : selected
                    ? "#ffffff"
                    : textPrimary,
                }}>
                  {fmtHour(h)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {startHour !== null && (
          <Text style={{ marginTop: 12, fontSize: 13, color: textSecondary }}>
            {endHour !== null
              ? `Selected: ${fmtHour(startHour)} – ${fmtHour(endHour)} (${endHour - startHour}h)`
              : `Start: ${fmtHour(startHour)} — now tap end time`}
          </Text>
        )}
      </View>

      {/* Notes + Book */}
      {startHour !== null && endHour !== null && (
        <View style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: border, padding: 14, gap: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: textSecondary }}>Notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Practice session"
            placeholderTextColor={placeholder}
            style={{
              borderWidth: 1,
              borderColor: border,
              borderRadius: 8,
              padding: 10,
              fontSize: 14,
              color: inputText,
              backgroundColor: inputBg,
            }}
          />
          <TouchableOpacity
            onPress={handleBook}
            disabled={bookCourt.isPending}
            style={{
              backgroundColor: bookCourt.isPending ? "#86efac" : "#16a34a",
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            {bookCourt.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 15 }}>
                Confirm — {fmtHour(startHour)} to {fmtHour(endHour)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Legend */}
      <View style={{ flexDirection: "row", gap: 16, justifyContent: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: isDark ? "#334155" : "#f3f4f6" }} />
          <Text style={{ fontSize: 11, color: textSecondary }}>Booked</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "#16a34a" }} />
          <Text style={{ fontSize: 11, color: textSecondary }}>Selected</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 12, height: 12, borderRadius: 3, borderWidth: 1, borderColor: border }} />
          <Text style={{ fontSize: 11, color: textSecondary }}>Available</Text>
        </View>
      </View>
    </ScrollView>
  );
}
