import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Logo } from "@/src/components/Logo";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";

export default function OnboardingScreen() {
  return (
    <ScreenContainer centered>
      <Logo size={156} />
      <View style={styles.copy}>
        <Text style={styles.title}>Brocolito é o segredo</Text>
        <Text style={styles.subtitle}>Desbloqueie sua melhor versão com consistência</Text>
      </View>

      <Button
        title="Começar sua jornada"
        onPress={() => router.push("/register")}
        style={styles.button}
      />

      <Pressable onPress={() => router.push("/login")} hitSlop={10}>
        <Text style={styles.login}>Já tenho uma conta</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  copy: {
    alignItems: "center",
    marginBottom: 34,
    marginTop: 22,
    gap: 10,
  },
  title: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 30,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(185, 100, 48, 0.8)",
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  button: {
    width: "100%",
  },
  login: {
    color: colors.accent,
    fontFamily: fontFamily.bold,
    fontSize: 16,
    marginTop: 22,
  },
});
