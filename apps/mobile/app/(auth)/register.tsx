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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-12">
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gray-900">Tenis</Text>
            <Text className="text-gray-500 mt-1">Create your account</Text>
          </View>

          {/* Step indicators */}
          <View className="flex-row items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <View key={s} className="flex-row items-center gap-2">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    step >= s ? "bg-green-600" : "bg-gray-200"
                  }`}
                >
                  <Text className={`text-sm font-bold ${step >= s ? "text-white" : "text-gray-500"}`}>
                    {s}
                  </Text>
                </View>
                {s < 2 && (
                  <View className={`w-12 h-0.5 ${step > s ? "bg-green-600" : "bg-gray-200"}`} />
                )}
              </View>
            ))}
          </View>

          {step === 1 && (
            <View className="space-y-4">
              <Text className="text-xl font-bold text-gray-900 mb-2">Account details</Text>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Full Name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Roger Federer"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Username</Text>
                <TextInput
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase())}
                  autoCapitalize="none"
                  placeholder="roger_federer"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
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
              <Text className="text-xl font-bold text-gray-900 mb-2">Your tennis profile</Text>

              <Text className="text-sm font-medium text-gray-700">Skill level</Text>
              <View className="grid grid-cols-2 gap-2">
                {SKILL_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() => setSkillLevel(level.value)}
                    className={`p-4 border-2 rounded-xl mb-2 ${
                      skillLevel === level.value
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Text className="font-semibold text-sm text-gray-900">{level.label}</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">{level.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">City (optional)</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="New York"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  className="flex-1 py-4 border border-gray-300 rounded-xl items-center"
                >
                  <Text className="text-gray-700 font-semibold">Back</Text>
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
              <Text className="text-gray-500">Already have an account?</Text>
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
