import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { MeasurementForm } from "@/src/components/MeasurementForm";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { MeasurementPayload } from "@/src/types";

export default function NewMeasurementScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(payload: MeasurementPayload) {
    try {
      setLoading(true);
      setError("");
      await api.createMeasurement(payload);
      if (returnTo === "history" && router.canGoBack()) {
        router.back();
      } else {
        router.replace("/history");
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Nova medição</Text>
      <Text style={styles.subtitle}>Preencha peso, altura e as medidas que quiser acompanhar.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <MeasurementForm submitLabel="Salvar medição" loading={loading} onSubmit={handleSubmit} />
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
    marginBottom: 14,
    marginTop: 6,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
});
