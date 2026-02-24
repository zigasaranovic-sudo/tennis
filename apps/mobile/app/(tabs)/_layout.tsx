import { Tabs, Redirect } from "expo-router";
import { useColorScheme, View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth.store";
import { trpc } from "@/lib/trpc";

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  icon,
  iconFocused,
  label,
  focused,
}: {
  icon: IoniconName;
  iconFocused: IoniconName;
  label: string;
  focused: boolean;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const activeColor = "#16a34a";
  const inactiveColor = isDark ? "#64748b" : "#9ca3af";
  const color = focused ? activeColor : inactiveColor;

  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 2 }}>
      <Ionicons name={focused ? iconFocused : icon} size={22} color={color} />
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? "600" : "400",
          color,
          letterSpacing: 0.1,
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

  const { data: pendingRequests } = trpc.match.getRequests.useQuery(
    { type: "incoming", status: "pending", limit: 50 },
    { enabled: !!session }
  );
  const pendingCount = pendingRequests?.length ?? 0;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
        }}
      >
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
        headerStyle: {
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 17,
          color: isDark ? "#f1f5f9" : "#111827",
        },
        headerTintColor: isDark ? "#f1f5f9" : "#111827",
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 0,
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.25 : 0.06,
          shadowRadius: 10,
          elevation: 12,
        },
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: isDark ? "#64748b" : "#9ca3af",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="home-outline" iconFocused="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Find Players",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="search-outline" iconFocused="search" label="Find" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="chatbubble-ellipses-outline"
              iconFocused="chatbubble-ellipses"
              label="Messages"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "#ef4444", fontSize: 10 },
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="trophy-outline" iconFocused="trophy" label="Matches" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="courts"
        options={{
          title: "Courts",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="location-outline"
              iconFocused="location"
              label="Courts"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="person-circle-outline"
              iconFocused="person-circle"
              label="Profile"
              focused={focused}
            />
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
