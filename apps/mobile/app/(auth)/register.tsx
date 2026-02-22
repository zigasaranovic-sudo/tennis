import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useColorScheme,
} from "react-native";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";
import type { SkillLevel } from "@tenis/types";

const SKILL_LEVELS: { value: SkillLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "NTRP 1.0–2.5" },
  { value: "intermediate", label: "Intermediate", desc: "NTRP 3.0–3.5" },
  { value: "advanced", label: "Advanced", desc: "NTRP 4.0–4.5" },
  { value: "professional", label: "Professional", desc: "NTRP 5.0+" },
];

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const inputBg = isDark ? "#1e293b" : "#ffffff";
  const inputText = isDark ? "#f1f5f9" : "#111827";
  const placeholder = isDark ? "#64748b" : "#9ca3af";
  const border = isDark ? "#334155" : "#e5e7eb";
  const labelText = isDark ? "#94a3b8" : "#374151";
  const stepInactiveBg = isDark ? "#334155" : "#e5e7eb";
  const stepInactiveText = isDark ? "#94a3b8" : "#6b7280";
  const skillCardBorder = isDark ? "#334155" : "#e5e7eb";
  const skillCardSelectedBorder = "#16a34a";
  const skillCardSelectedBg = isDark ? "#14532d" : "#f0fdf4";
  const skillCardBg = isDark ? "#1e293b" : "#ffffff";
  const backBtnBorder = isDark ? "#334155" : "#d1d5db";
  const backBtnText = isDark ? "#94a3b8" : "#374151";

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !fullName || !username) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username.toLowerCase(),
        },
      },
    });
    if (error) {
      Alert.alert("Registration failed", error.message);
    } else {
      Alert.alert(
        "Check your email",
        "We sent you a confirmation link. Please verify your email to continue.",
        [{ text: "OK" }]
      );
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 12,
    fontSize: 16,
    color: inputText,
    backgroundColor: inputBg,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: bg }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-12">
          <View className="items-center mb-8">
            <Text style={{ color: textPrimary }} className="text-3xl font-bold">Tenis</Text>
            <Text style={{ color: textSecondary }} className="mt-1">Create your account</Text>
          </View>

          {/* Step indicators */}
          <View className="flex-row items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <View key={s} className="flex-row items-center gap-2">
                <View
                  style={
                    step >= s
                      ? { width: 32, height: 32, borderRadius: 16, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center" }
                      : { width: 32, height: 32, borderRadius: 16, backgroundColor: stepInactiveBg, alignItems: "center", justifyContent: "center" }
                  }
                >
                  <Text style={step >= s ? { color: "#ffffff", fontSize: 14, fontWeight: "700" } : { color: stepInactiveText, fontSize: 14, fontWeight: "700" }}>
                    {s}
                  </Text>
                </View>
                {s < 2 && (
                  <View style={{ width: 48, height: 2, backgroundColor: step > s ? "#16a34a" : stepInactiveBg }} />
                )}
              </View>
            ))}
          </View>

          {step === 1 && (
            <View className="space-y-4">
              <Text style={{ color: textPrimary }} className="text-xl font-bold mb-2">Account details</Text>

              <View>
                <Text style={{ color: labelText }} className="text-sm font-medium mb-1">Full Name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Roger Federer"
                  style={inputStyle}
                  placeholderTextColor={placeholder}
                />
              </View>

              <View>
                <Text style={{ color: labelText }} className="text-sm font-medium mb-1">Username</Text>
                <TextInput
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase())}
                  autoCapitalize="none"
                  placeholder="roger_federer"
                  style={inputStyle}
                  placeholderTextColor={placeholder}
                />
              </View>

              <View>
                <Text style={{ color: labelText }} className="text-sm font-medium mb-1">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  style={inputStyle}
                  placeholderTextColor={placeholder}
                />
              </View>

              <View>
                <Text style={{ color: labelText }} className="text-sm font-medium mb-1">Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="At least 8 characters"
                  style={inputStyle}
                  placeholderTextColor={placeholder}
                />
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (!fullName || !username || !email || password.length < 8) {
                    Alert.alert("Error", "Please fill in all fields (min 8 char password)");
                    return;
                  }
                  setStep(2);
                }}
                className="mt-4 py-4 bg-green-600 rounded-xl items-center"
              >
                <Text className="text-white font-semibold text-base">Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View className="space-y-4">
              <Text style={{ color: textPrimary }} className="text-xl font-bold mb-2">Your tennis profile</Text>

              <Text style={{ color: labelText }} className="text-sm font-medium">Skill level</Text>
              <View className="grid grid-cols-2 gap-2">
                {SKILL_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() => setSkillLevel(level.value)}
                    style={{
                      padding: 16,
                      borderWidth: 2,
                      borderRadius: 12,
                      marginBottom: 8,
                      borderColor: skillLevel === level.value ? skillCardSelectedBorder : skillCardBorder,
                      backgroundColor: skillLevel === level.value ? skillCardSelectedBg : skillCardBg,
                    }}
                  >
                    <Text style={{ color: textPrimary }} className="font-semibold text-sm">{level.label}</Text>
                    <Text style={{ color: textSecondary }} className="text-xs mt-0.5">{level.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View>
                <Text style={{ color: labelText }} className="text-sm font-medium mb-1">City (optional)</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="New York"
                  style={inputStyle}
                  placeholderTextColor={placeholder}
                />
              </View>

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  style={{ borderColor: backBtnBorder, borderWidth: 1 }}
                  className="flex-1 py-4 rounded-xl items-center"
                >
                  <Text style={{ color: backBtnText }} className="font-semibold">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={loading}
                  className={`flex-1 py-4 rounded-xl items-center ${
                    loading ? "bg-green-400" : "bg-green-600"
                  }`}
                >
                  <Text className="text-white font-semibold">
                    {loading ? "Creating..." : "Create Account"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 1 && (
            <View className="flex-row justify-center mt-6 gap-1">
              <Text style={{ color: textSecondary }}>Already have an account?</Text>
              <Link href="/(auth)/login">
                <Text className="text-green-600 font-medium">Sign in</Text>
              </Link>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
