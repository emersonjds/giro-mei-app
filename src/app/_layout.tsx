import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FlowProvider } from "@/lib/flow";
import { C } from "@/lib/ui";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FlowProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: C.bg },
            animation: "slide_from_right",
          }}
        />
      </FlowProvider>
    </SafeAreaProvider>
  );
}
