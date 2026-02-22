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

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const inputBg = isDark ? "#1e293b" : "#ffffff";
  const inputText = isDark ? "#f1f5f9" : "#111827";
  const placeholder = isDark ? "#64748b" : "#9ca3af";
  const labelText = isDark ? "#94a3b8" : "#374151";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert("Sign in failed", error.message);
    setLoading(false);
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
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-green-600 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">🎾</Text>
            </View>
            <Text style={{ color: textPrimary }} className="text-3xl font-bold">Tenis</Text>
            <Text style={{ color: textSecondary }} className="mt-1">Find your match</Text>
          </View>

          <Text style={{ color: textPrimary }} className="text-2xl font-bold mb-6">Sign in</Text>

          <View className="space-y-4">
            <View>
              <Text style={{ color: labelText }} className="text-sm font-medium mb-1">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: border,
                  borderRadius: 12,
                  fontSize: 16,
                  color: inputText,
                  backgroundColor: inputBg,
                }}
                placeholderTextColor={placeholder}
              />
            </View>

            <View>
              <Text style={{ color: labelText }} className="text-sm font-medium mb-1">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: border,
                  borderRadius: 12,
                  fontSize: 16,
                  color: inputText,
                  backgroundColor: inputBg,
                }}
                placeholderTextColor={placeholder}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className={`mt-6 py-4 rounded-xl items-center ${
              loading ? "bg-green-400" : "bg-green-600"
            }`}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? "Signing in..." : "Sign in"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6 gap-1">
            <Text style={{ color: textSecondary }}>Don&apos;t have an account?</Text>
            <Link href="/(auth)/register">
              <Text className="text-green-600 font-medium">Create one</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
