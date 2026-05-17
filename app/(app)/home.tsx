import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/src/components/Card";
import { Logo } from "@/src/components/Logo";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { BodyMeasurement } from "@/src/types";
import { buildWeightGoalProgressMessage, weightGoalLabel } from "@/src/utils/goals";
import { formatMeasurementDate, formatNumber, getLatestMeasurement } from "@/src/utils/measurements";

export default function HomeScreen() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [compare, setCompare] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadDashboard() {
        try {
          setLoading(true);
          setError("");
          const [measurementsResult, compareResult] = await Promise.allSettled([
            api.listMeasurements(),
            api.compareMeasurements(),
          ]);

          if (!isActive) {
            return;
          }

          if (measurementsResult.status === "fulfilled") {
            setMeasurements(measurementsResult.value);
          }

          if (compareResult.status === "fulfilled") {
            setCompare(compareResult.value);
          }

          if (measurementsResult.status === "rejected") {
            throw measurementsResult.reason;
          }
        } catch (dashboardError) {
          setError(
            dashboardError instanceof Error
              ? dashboardError.message
              : "Não foi possível carregar seus dados.",
          );
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadDashboard();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const latestMeasurement = getLatestMeasurement(measurements);
  const hasComparison = Boolean(compare) && measurements.length > 1;
  const progressMessage = buildWeightGoalProgressMessage(user?.weight_goal, measurements);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>BROCOLITO</Text>
          <Text style={styles.greeting}>Olá, {user?.name ?? "Brocolito"}</Text>
          <Text style={styles.subtitle}>Seu acompanhamento corporal em um só lugar.</Text>
        </View>
        <Logo size={72} />
      </View>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Peso atual</Text>
            <Text style={styles.heroValue}>{formatNumber(latestMeasurement?.weight_kg, " kg")}</Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="barbell-outline" size={26} color={colors.white} />
          </View>
        </View>
        <View style={styles.heroDivider} />
        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaItem}>
            <Text style={styles.heroMetaLabel}>Altura</Text>
            <Text style={styles.heroMetaValue}>{formatNumber(latestMeasurement?.height_cm, " cm")}</Text>
          </View>
          <View style={styles.heroMetaItem}>
            <Text style={styles.heroMetaLabel}>Última medição</Text>
            <Text style={styles.heroMetaValue}>
              {latestMeasurement ? formatMeasurementDate(latestMeasurement) : "Sem registro"}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressIcon}>
            <Ionicons name="trending-up-outline" size={22} color={colors.accent} />
          </View>
          <View style={styles.progressCopy}>
            <Text style={styles.cardTitle}>Evolução</Text>
            <Text style={styles.cardText}>
              {progressMessage
                ? progressMessage.text
                : hasComparison
                  ? "Seu comparativo já está pronto para consulta."
                  : "Cadastre ao menos duas medições para visualizar seu progresso."}
            </Text>
            {user?.weight_goal ? (
              <Text style={styles.goalText}>Objetivo: {weightGoalLabel(user.weight_goal)}</Text>
            ) : null}
          </View>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Ações rápidas</Text>
      <View style={styles.actions}>
        <ActionCard icon="add-circle-outline" title="Nova medição" onPress={() => router.push("/new-measurement")} />
        <ActionCard icon="list-outline" title="Histórico" onPress={() => router.push("/history")} />
        <ActionCard icon="stats-chart-outline" title="Comparativo" onPress={() => router.push("/compare")} />
        <ActionCard icon="person-outline" title="Perfil" onPress={() => router.push("/profile")} />
      </View>
    </ScreenContainer>
  );
}

function ActionCard({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
      <Ionicons name={icon} size={25} color={colors.primary} />
      <Text style={styles.actionTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
    gap: 18,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: fontFamily.extraBold,
    fontSize: 12,
    letterSpacing: 0,
    marginBottom: 4,
  },
  greeting: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 30,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderColor: "transparent",
    padding: 22,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  heroLabel: {
    color: "rgba(255, 255, 255, 0.82)",
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
  },
  heroValue: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 38,
    marginTop: 4,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 999,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  heroDivider: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    height: 1,
    marginVertical: 18,
  },
  heroMetaRow: {
    flexDirection: "row",
    gap: 14,
  },
  heroMetaItem: {
    flex: 1,
  },
  heroMetaLabel: {
    color: "rgba(255, 255, 255, 0.72)",
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
  },
  heroMetaValue: {
    color: colors.white,
    fontFamily: fontFamily.extraBold,
    fontSize: 16,
    marginTop: 5,
  },
  progressCard: {
    marginTop: 14,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  progressIcon: {
    alignItems: "center",
    backgroundColor: "rgba(185, 100, 48, 0.12)",
    borderRadius: 999,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  progressCopy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
  cardText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
  },
  goalText: {
    color: colors.accent,
    fontFamily: fontFamily.extraBold,
    fontSize: 13,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    marginBottom: 12,
    marginTop: 24,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 104,
    justifyContent: "space-between",
    padding: 16,
  },
  actionTitle: {
    color: colors.title,
    fontFamily: fontFamily.extraBold,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.82,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
});
