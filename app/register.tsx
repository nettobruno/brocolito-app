import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { Logo } from "@/src/components/Logo";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { WeightGoalSelector } from "@/src/components/WeightGoalSelector";
import { useAuth } from "@/src/context/AuthContext";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { WeightGoal } from "@/src/types";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [weightGoal, setWeightGoal] = useState<WeightGoal>("lose_weight");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    try {
      setLoading(true);
      setError("");
      await signUp({ name: name.trim(), email: email.trim(), password, weight_goal: weightGoal });
      router.replace("/home");
    } catch (registerError) {
      setError(
        registerError instanceof Error ? registerError.message : "Não foi possível criar a conta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <Logo size={118} />
      <Text style={styles.title}>Bem-vindo(a) ao desafio</Text>
      <Text style={styles.subtitle}>
        Sua jornada para uma vida saudável começa preenchendo os dados abaixo
      </Text>

      <Input label="Nome" value={name} onChangeText={setName} />
      <Input
        label="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Senha"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
        rightElement={
          <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={8}>
            <Text style={styles.passwordToggle}>{showPassword ? "Esconder" : "Ver"}</Text>
          </Pressable>
        }
      />
      <WeightGoalSelector value={weightGoal} onChange={setWeightGoal} />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Começar Jornada" loading={loading} onPress={handleRegister} />

      <Pressable onPress={() => router.push("/login")} style={styles.footerLink}>
        <Text style={styles.footerMuted}>Já tem conta? </Text>
        <Text style={styles.footerAccent}>Entre aqui</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 26,
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    color: colors.accent,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    marginTop: 8,
    opacity: 0.8,
    textAlign: "center",
  },
  passwordToggle: {
    color: colors.accent,
    fontFamily: fontFamily.extraBold,
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
