import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { BodyMeasurement } from "@/src/types";
import { buildWeightGoalProgressMessage } from "@/src/utils/goals";
import { buildHealthInsight, hasHealthInsight } from "@/src/utils/healthInsights";
import { measurementFields } from "@/src/utils/measurements";

const comparisonLabels = Object.fromEntries(
  measurementFields.map((field) => {
    const key = field.key.endsWith("_kg")
      ? field.key.replace(/_kg$/, "_change_kg")
      : field.key.replace(/_cm$/, "_change_cm");

    return [key, field.label];
  }),
);

function labelizeFallback(key: string) {
  return key
    .replace(/_change_kg$/, " kg")
    .replace(/_change_cm$/, " cm")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace("Kg", "kg")
    .replace("Cm", "cm");
}

function comparisonLabel(key: string) {
  return comparisonLabels[key] ?? labelizeFallback(key);
}

function renderValue(value: unknown) {
  if (typeof value === "number") {
    return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  }

  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "-";
  }

  return JSON.stringify(value);
}

function numericValue(value: unknown) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function metricUnit(key: string) {
  return key.endsWith("_kg") ? "kg" : "cm";
}

type HealthInsight = {
  title: string;
  text: string;
};

function ComparisonMetric({
  metricKey,
  onOpenInsight,
  value,
}: {
  metricKey: string;
  onOpenInsight: (key: string, value: unknown) => void;
  value: unknown;
}) {
  const parsedValue = numericValue(value);
  const canShowInsight = hasHealthInsight(metricKey, value);
  const isPositive = parsedValue != null && parsedValue > 0;
  const isNegative = parsedValue != null && parsedValue < 0;
  const iconName = isPositive ? "arrow-up" : isNegative ? "arrow-down" : "remove";
  const toneStyle = isPositive ? styles.metricPositive : isNegative ? styles.metricNegative : styles.metricNeutral;
  const valuePrefix = isPositive ? "+" : "";

  return (
    <Card style={styles.metricCard}>
      <View style={styles.metricTop}>
        <View style={[styles.metricIcon, toneStyle]}>
          <Ionicons name={iconName} size={16} color={colors.white} />
        </View>
        {canShowInsight ? (
          <Pressable onPress={() => onOpenInsight(metricKey, value)} hitSlop={8} style={styles.infoButton}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.accent} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.metricLabel}>{comparisonLabel(metricKey)}</Text>
      <Text style={styles.metricValue}>
        {parsedValue == null ? renderValue(value) : `${valuePrefix}${renderValue(parsedValue)}`}
        {parsedValue == null ? "" : ` ${metricUnit(metricKey)}`}
      </Text>
    </Card>
  );
}

function flattenComparisonEntries(entries: [string, unknown][]) {
  return entries.flatMap(([key, value]) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return [[key, value] as [string, unknown]];
    }

    return Object.entries(value as Record<string, unknown>);
  });
}

export default function CompareScreen() {
  const { user } = useAuth();
  const [compare, setCompare] = useState<Record<string, unknown> | null>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<HealthInsight | null>(null);
  const [measurementCount, setMeasurementCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      async function loadCompare() {
        try {
          setLoading(true);
          setError("");
          const measurements = await api.listMeasurements();
          setMeasurements(measurements);
          setMeasurementCount(measurements.length);

          if (measurements.length < 2) {
            setCompare(null);
            return;
          }

          setCompare(await api.compareMeasurements());
        } catch (compareError) {
          setError(
            compareError instanceof Error
              ? compareError.message
              : "Não foi possível carregar o comparativo.",
          );
        } finally {
          setLoading(false);
        }
      }

      loadCompare();
    }, []),
  );

  const entries = compare ? Object.entries(compare) : [];
  const metricEntries = flattenComparisonEntries(entries).filter(([, value]) => value != null);
  const hasNotEnoughMeasurements = !loading && !error && measurementCount < 2;
  const progressMessage = buildWeightGoalProgressMessage(user?.weight_goal, measurements);

  function openHealthInsight(key: string, value: unknown) {
    const insight = buildHealthInsight({
      goal: user?.weight_goal,
      key,
      measurements,
      value,
    });

    if (insight) {
      setSelectedInsight(insight);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Comparativo</Text>
      <Text style={styles.subtitle}>Veja a diferença entre a primeira e a última medição.</Text>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {hasNotEnoughMeasurements ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Não tem medição no momento</Text>
          <Text style={styles.emptyText}>
            Cadastre pelo menos duas medições para comparar sua evolução.
          </Text>
        </Card>
      ) : null}

      {progressMessage ? (
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressIcon}>
              <Ionicons name="sparkles-outline" size={24} color={colors.white} />
            </View>
            <View style={styles.progressCopy}>
              <Text style={styles.progressTitle}>{progressMessage.title}</Text>
              <Text style={styles.progressText}>{progressMessage.text}</Text>
            </View>
          </View>
        </Card>
      ) : null}

      {!loading && !error && measurementCount >= 2 && metricEntries.length === 0 ? (
        <Text style={styles.empty}>Não foi possível montar o comparativo agora.</Text>
      ) : null}

      {metricEntries.length > 0 ? <Text style={styles.sectionTitle}>Variações registradas</Text> : null}
      <View style={styles.metricGrid}>
        {metricEntries.map(([key, value]) => (
          <ComparisonMetric
            key={key}
            metricKey={key}
            value={value}
            onOpenInsight={openHealthInsight}
          />
        ))}
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(selectedInsight)}
        onRequestClose={() => setSelectedInsight(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedInsight(null)} />
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="alert-circle-outline" size={28} color={colors.accent} />
            </View>
            <Text style={styles.modalTitle}>{selectedInsight?.title}</Text>
            <Text style={styles.modalText}>{selectedInsight?.text}</Text>
            <Text style={styles.modalDisclaimer}>
              Informação educativa. Não substitui avaliação de um profissional de saúde.
            </Text>
            <Button title="Entendi" onPress={() => setSelectedInsight(null)} style={styles.modalButton} />
          </View>
        </View>
      </Modal>
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
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sectionTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    marginBottom: 12,
    marginTop: 6,
  },
  infoButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  metricCard: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 142,
    padding: 16,
  },
  metricTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  metricIcon: {
    alignItems: "center",
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  metricPositive: {
    backgroundColor: colors.accent,
  },
  metricNegative: {
    backgroundColor: colors.primary,
  },
  metricNeutral: {
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  metricLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 19,
    minHeight: 38,
  },
  metricValue: {
    color: colors.title,
    fontFamily: fontFamily.extraBold,
    fontSize: 25,
    marginTop: 8,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: colors.primary,
    borderColor: "transparent",
    marginBottom: 12,
    padding: 18,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  progressIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 999,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  progressCopy: {
    flex: 1,
  },
  progressTitle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 18,
  },
  progressText: {
    color: "rgba(255, 255, 255, 0.84)",
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 5,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 28,
  },
  emptyTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    textAlign: "center",
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
    width: "100%",
    maxWidth: 440,
  },
  modalIcon: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(185, 100, 48, 0.12)",
    borderRadius: 999,
    height: 52,
    justifyContent: "center",
    marginBottom: 12,
    width: 52,
  },
  modalTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    textAlign: "center",
  },
  modalText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 10,
    textAlign: "center",
  },
  modalDisclaimer: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 12,
    opacity: 0.8,
    textAlign: "center",
  },
  modalButton: {
    marginTop: 18,
  },
});
