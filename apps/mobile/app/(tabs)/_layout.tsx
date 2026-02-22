import { Tabs, Redirect } from "expo-router";
import { Text } from "react-native";
import { useAuthStore } from "@/store/auth.store";
import { ActivityIndicator, View } from "react-native";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? "600" : "400",
          color: focused ? "#16a34a" : "#6b7280",
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
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
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#111827",
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 72,
          paddingBottom: 16,
          paddingTop: 8,
          borderTopColor: "#e5e7eb",
        },
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#6b7280",
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
        name="matches"
        options={{
          title: "Matches",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🎾" label="Matches" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "Rankings",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏆" label="Ranking" focused={focused} />
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
    </Tabs>
  );
}
