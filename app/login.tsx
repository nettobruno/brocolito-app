import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { Logo } from "@/src/components/Logo";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { useAuth } from "@/src/context/AuthContext";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      setLoading(true);
      setError("");
      await signIn(email.trim(), password);
      router.replace("/home");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <Logo size={126} />
      <Text style={styles.title}>Bem-vindo(a) de volta!</Text>
      <Text style={styles.subtitle}>Pronto para os desafios de hoje?</Text>

      <Input
        label="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input label="Senha" secureTextEntry value={password} onChangeText={setPassword} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Entrar" loading={loading} onPress={handleLogin} />

      <Pressable onPress={() => router.push("/register")} style={styles.footerLink}>
        <Text style={styles.footerMuted}>Novo por aqui? </Text>
        <Text style={styles.footerAccent}>Crie sua conta</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 26,
    marginTop: 22,
    textAlign: "center",
  },
  subtitle: {
    color: colors.accent,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    marginBottom: 28,
    marginTop: 8,
    opacity: 0.8,
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
  footerLink: {
    alignSelf: "center",
    flexDirection: "row",
    marginTop: 22,
  },
  footerMuted: {
    color: colors.textMuted,
    fontFamily: fontFamily.bold,
    fontSize: 15,
  },
  footerAccent: {
    color: colors.accent,
    fontFamily: fontFamily.bold,
    fontSize: 15,
  },
});
