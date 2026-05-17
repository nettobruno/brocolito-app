import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { Input } from "@/src/components/Input";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { WeightGoalSelector } from "@/src/components/WeightGoalSelector";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { WeightGoal } from "@/src/types";

export default function ProfileScreen() {
  const { signOut, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [weightGoal, setWeightGoal] = useState<WeightGoal>("lose_weight");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        try {
          setLoading(true);
          setError("");
          const response = await api.getMe();
          setName(response.name);
          setEmail(response.email);
          setWeightGoal(response.weight_goal);
          await updateUser(response);
        } catch (profileError) {
          setError(profileError instanceof Error ? profileError.message : "Não foi possível carregar.");
        } finally {
          setLoading(false);
        }
      }

      loadProfile();
    }, [updateUser]),
  );

  async function handleSaveProfile() {
    try {
      setSavingProfile(true);
      setError("");
      setMessage("");
      const response = await api.updateMe({
        name: name.trim(),
        email: email.trim(),
        weight_goal: weightGoal,
      });
      await updateUser(response);
      setMessage("Perfil atualizado.");
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : "Não foi possível salvar.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePassword() {
    if (!newPassword || newPassword !== passwordConfirmation) {
      setError("Confirme a nova senha corretamente.");
      return;
    }

    try {
      setSavingPassword(true);
      setError("");
      setMessage("");
      await api.updatePassword({
        current_password: currentPassword || undefined,
        password: newPassword,
        password_confirmation: passwordConfirmation,
      });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
      setMessage("Senha atualizada.");
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : "Não foi possível alterar a senha.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/onboarding");
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.subtitle}>Gerencie seus dados de acesso.</Text>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Dados pessoais</Text>
        <Input label="Nome" value={name} onChangeText={setName} />
        <Input
          label="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <WeightGoalSelector value={weightGoal} onChange={setWeightGoal} />
        <Button title="Salvar perfil" loading={savingProfile} onPress={handleSaveProfile} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Alterar senha</Text>
        <Input
          label="Senha atual"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <Input label="Nova senha" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        <Input
          label="Confirmar nova senha"
          secureTextEntry
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
        />
        <Button title="Salvar senha" loading={savingPassword} onPress={handleSavePassword} />
      </Card>

      <Button title="Sair" variant="outline" onPress={handleSignOut} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 26,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
    marginTop: 6,
  },
  card: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    marginBottom: 12,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
  message: {
    color: colors.primary,
    fontFamily: fontFamily.extraBold,
    marginBottom: 12,
  },
});
