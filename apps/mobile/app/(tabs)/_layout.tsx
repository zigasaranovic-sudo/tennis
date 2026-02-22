import { Tabs, Redirect } from "expo-router";
import { Text, useColorScheme } from "react-native";
import { useAuthStore } from "@/store/auth.store";
import { ActivityIndicator, View } from "react-native";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 9,
          fontWeight: focused ? "600" : "400",
          color: focused ? "#16a34a" : isDark ? "#94a3b8" : "#6b7280",
          marginTop: 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { session, isLoading } = useAuthStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "#0f172a" : "#ffffff" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: isDark ? "#0f172a" : "#ffffff" },
        headerTintColor: isDark ? "#f1f5f9" : "#111827",
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 64,
          paddingBottom: 12,
          paddingTop: 6,
          borderTopColor: isDark ? "#334155" : "#e5e7eb",
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
        },
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: isDark ? "#94a3b8" : "#6b7280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Find Players",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" label="Find" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💬" label="Messages" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🎾" label="Matches" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="courts"
        options={{
          title: "Courts",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏟️" label="Courts" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          href: null,
          title: "Rankings",
        }}
      />
    </Tabs>
  );
}
