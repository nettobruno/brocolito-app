import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/src/context/AuthContext";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";

export default function AppLayout() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (!isBootstrapping && !isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Voltar",
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.title,
        headerTitleStyle: { color: colors.title, fontFamily: fontFamily.bold },
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="check-in" options={{ title: "Check-in" }} />
      <Stack.Screen name="new-measurement" options={{ title: "Nova medição" }} />
      <Stack.Screen name="history" options={{ title: "Histórico" }} />
      <Stack.Screen name="compare" options={{ title: "Comparativo" }} />
      <Stack.Screen name="profile" options={{ title: "Perfil" }} />
      <Stack.Screen name="measurements/[id]" options={{ title: "Medição" }} />
    </Stack>
  );
}
