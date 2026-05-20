import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { BodyMeasurement } from "@/src/types";
import {
  formatMeasurementDate,
  formatNumber,
  measurementFields,
} from "@/src/utils/measurements";

export default function HistoryScreen() {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMeasurements = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.listMeasurements();
      setMeasurements(response);
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : "Não foi possível carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMeasurements();
    }, [loadMeasurements]),
  );

  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort((first, second) => {
      const firstTime = new Date(first.created_at ?? first.updated_at ?? 0).getTime();
      const secondTime = new Date(second.created_at ?? second.updated_at ?? 0).getTime();

      if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) {
        return second.id - first.id;
      }

      return secondTime - firstTime;
    });
  }, [measurements]);
  const latestMeasurement = sortedMeasurements[0];
  const previousMeasurement = sortedMeasurements[1];
  const weightChange =
    latestMeasurement?.weight_kg != null && previousMeasurement?.weight_kg != null
      ? Number(latestMeasurement.weight_kg) - Number(previousMeasurement.weight_kg)
      : null;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Histórico</Text>
          <Text style={styles.subtitle}>Suas medições cadastradas.</Text>
        </View>
        <Button
          title="Nova"
          onPress={() =>
            router.push({
              pathname: "/new-measurement",
              params: { returnTo: "history" },
            })
          }
          style={styles.newButton}
        />
      </View>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && measurements.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhuma medição cadastrada ainda.</Text>
          <Text style={styles.emptyText}>
            Crie sua primeira medição para acompanhar seu histórico corporal.
          </Text>
        </Card>
      ) : null}

      {latestMeasurement ? (
        <Card style={styles.latestCard}>
          <View style={styles.latestHeader}>
            <View style={styles.latestIcon}>
              <Ionicons name="scale-outline" size={24} color={colors.white} />
            </View>
            <View style={styles.latestCopy}>
              <Text style={styles.latestLabel}>Última medição</Text>
              <Text style={styles.latestDate}>{formatMeasurementDate(latestMeasurement)}</Text>
            </View>
          </View>
          <View style={styles.latestBody}>
            <View>
              <Text style={styles.latestValue}>{formatNumber(latestMeasurement.weight_kg, " kg")}</Text>
              <Text style={styles.latestCaption}>Peso atual</Text>
            </View>
            {weightChange != null ? (
              <View style={styles.deltaPill}>
                <Ionicons
                  name={weightChange <= 0 ? "trending-down-outline" : "trending-up-outline"}
                  size={16}
                  color={colors.accent}
                />
                <Text style={styles.deltaText}>
                  {weightChange > 0 ? "+" : ""}
                  {formatNumber(weightChange, " kg")}
                </Text>
              </View>
            ) : null}
          </View>
        </Card>
      ) : null}

      <View style={styles.list}>
        {sortedMeasurements.map((measurement, index) => (
          <MeasurementHistoryCard index={index} key={measurement.id} measurement={measurement} />
        ))}
      </View>
    </ScreenContainer>
  );
}

function MeasurementHistoryCard({
  measurement,
  index,
}: {
  measurement: BodyMeasurement;
  index: number;
}) {
  const highlightedFields = measurementFields
    .slice(3, 8)
    .filter((field) => measurement[field.key] != null)
    .slice(0, 4);

  return (
    <Pressable
      accessibilityHint="Abre os detalhes desta medição."
      accessibilityLabel={`Medição de ${formatMeasurementDate(measurement)}`}
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/measurements/[id]",
          params: { id: String(measurement.id) },
        })
      }
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.itemCard}>
        <View style={styles.timelineRail}>
          <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
          <View style={styles.timelineLine} />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View>
              <Text style={styles.itemTitle}>{formatMeasurementDate(measurement)}</Text>
              <Text style={styles.itemSubtitle}>Registro corporal</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={colors.primary} />
          </View>

          <View style={styles.itemMetrics}>
            <View style={styles.primaryMetric}>
              <Text style={styles.metricLabel}>Peso</Text>
              <Text style={styles.primaryMetricValue}>{formatNumber(measurement.weight_kg, " kg")}</Text>
            </View>
            <View style={styles.primaryMetric}>
              <Text style={styles.metricLabel}>Altura</Text>
              <Text style={styles.primaryMetricValue}>{formatNumber(measurement.height_cm, " cm")}</Text>
            </View>
          </View>

          <View style={styles.measurementChips}>
            {highlightedFields.map((field) => (
              <View key={field.key} style={styles.measurementChip}>
                <Text style={styles.measurementChipLabel}>{field.shortLabel}</Text>
                <Text style={styles.measurementChipValue}>{formatNumber(measurement[field.key], " cm")}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 12,
  },
  title: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 26,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    marginTop: 4,
  },
  newButton: {
    minHeight: 44,
    minWidth: 82,
  },
  latestCard: {
    backgroundColor: colors.primary,
    borderColor: "transparent",
    marginBottom: 14,
    padding: 20,
  },
  latestHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  latestIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  latestCopy: {
    flex: 1,
  },
  latestLabel: {
    color: "rgba(255, 255, 255, 0.76)",
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
  },
  latestDate: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    marginTop: 2,
  },
  latestBody: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 12,
  },
  latestValue: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 36,
  },
  latestCaption: {
    color: "rgba(255, 255, 255, 0.76)",
    fontFamily: fontFamily.semiBold,
    marginTop: 2,
  },
  deltaPill: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deltaText: {
    color: colors.accent,
    fontFamily: fontFamily.extraBold,
    fontSize: 13,
  },
  list: {
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  itemTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
  itemSubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    marginTop: 2,
  },
  timelineRail: {
    alignItems: "center",
    paddingTop: 4,
    width: 18,
  },
  timelineDot: {
    backgroundColor: "rgba(100, 148, 109, 0.2)",
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 2,
    height: 14,
    width: 14,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
  },
  timelineLine: {
    backgroundColor: "rgba(100, 148, 109, 0.22)",
    flex: 1,
    marginTop: 6,
    width: 2,
  },
  itemMetrics: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  primaryMetric: {
    backgroundColor: "rgba(100, 148, 109, 0.1)",
    borderRadius: 16,
    flex: 1,
    padding: 12,
  },
  metricLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
  },
  primaryMetricValue: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 19,
    marginTop: 3,
  },
  measurementChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  measurementChip: {
    backgroundColor: "rgba(185, 100, 48, 0.09)",
    borderColor: "rgba(185, 100, 48, 0.2)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  measurementChipLabel: {
    color: colors.accent,
    fontFamily: fontFamily.extraBold,
    fontSize: 11,
  },
  measurementChipValue: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 13,
    marginTop: 1,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
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
  pressed: {
    opacity: 0.82,
  },
});
