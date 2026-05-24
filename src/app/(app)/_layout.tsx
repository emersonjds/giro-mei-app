import { Tabs } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

import { C } from "@/lib/ui";

/** Ícone de aba: quando ativo, ganha a pílula menta (identidade Giromei). */
function tabIcon(emoji: string) {
  const Icon = ({ focused }: { focused: boolean }) => (
    <View style={[ts.icon, focused && ts.iconActive]}>
      <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.9 }}>{emoji}</Text>
    </View>
  );
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
          height: 64,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="inicio" options={{ title: "Início", tabBarIcon: tabIcon("🏠") }} />
      <Tabs.Screen name="credito" options={{ title: "Crédito", tabBarIcon: tabIcon("💳") }} />
      <Tabs.Screen name="gestao" options={{ title: "Gestão", tabBarIcon: tabIcon("📊") }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: tabIcon("👤") }} />
      {/* Rotas acessíveis mas fora da barra (linkadas de dentro das telas). */}
      <Tabs.Screen name="docs" options={{ href: null }} />
    </Tabs>
  );
}

const ts = StyleSheet.create({
  icon: {
    minWidth: 48,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  iconActive: { backgroundColor: C.mintSoft },
});
