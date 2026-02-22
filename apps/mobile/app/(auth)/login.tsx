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

export default function LoginScreen() {
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
      className="flex-1 bg-white"
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
            <Text className="text-3xl font-bold text-gray-900">Tenis</Text>
            <Text className="text-gray-500 mt-1">Find your match</Text>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-6">Sign in</Text>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
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
                placeholder="••••••••"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base text-gray-900"
                placeholderTextColor="#9ca3af"
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
            <Text className="text-gray-500">Don&apos;t have an account?</Text>
            <Link href="/(auth)/register">
              <Text className="text-green-600 font-medium">Create one</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
