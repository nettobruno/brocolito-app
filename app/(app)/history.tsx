import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
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

      <View style={styles.list}>
        {measurements.map((measurement) => (
          <Pressable
            key={measurement.id}
            onPress={() =>
              router.push({
                pathname: "/measurements/[id]",
                params: { id: String(measurement.id) },
              })
            }
          >
            <Card>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{formatMeasurementDate(measurement)}</Text>
              </View>
              <Text style={styles.itemText}>
                Peso: {formatNumber(measurement.weight_kg, " kg")}  Altura:{" "}
                {formatNumber(measurement.height_cm, " cm")}
              </Text>
              <Text style={styles.itemText}>
                {measurementFields
                  .slice(2, 6)
                  .filter((field) => measurement[field.key] != null)
                  .map((field) => `${field.shortLabel}: ${formatNumber(measurement[field.key], " cm")}`)
                  .join("  ")}
              </Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
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
  list: {
    gap: 12,
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
  itemText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    lineHeight: 21,
    marginTop: 8,
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
});
