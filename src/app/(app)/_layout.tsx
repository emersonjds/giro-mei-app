import { Tabs } from "expo-router";
import { Text } from "react-native";

import { C } from "@/lib/ui";

function tabIcon(emoji: string) {
  const Icon = () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;
  Icon.displayName = `TabIcon(${emoji})`;
  return Icon;
}

export default function AppTabsLayout() {
  return (
    <Tabs
      initialRouteName="inicio"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.faint,
        tabBarStyle: {
          backgroundColor: C.card,
          borderTopColor: C.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{ title: "Início", tabBarIcon: tabIcon("🏠") }}
      />
      <Tabs.Screen
        name="credito"
        options={{ title: "Crédito", tabBarIcon: tabIcon("💳") }}
      />
      <Tabs.Screen
        name="entradas"
        options={{ title: "Entradas", tabBarIcon: tabIcon("📈") }}
      />
      <Tabs.Screen
        name="docs"
        options={{ title: "Docs", tabBarIcon: tabIcon("📄") }}
      />
    </Tabs>
  );
}
