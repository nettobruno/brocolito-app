import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { TrainingActivity, TrainingCheckIn, TrainingCheckInPayload } from "@/src/types";
import { formatTrainingActivities, trainingActivityOptions } from "@/src/utils/trainingCheckIns";

function buildDefaultTodayCheckIn(): TrainingCheckIn {
  return {
    date: new Date().toISOString().slice(0, 10),
    trained: false,
    activities: [],
    checked_in: false,
  };
}

function isNotFoundError(error: unknown) {
  return error instanceof Error && error.message === "Registro não encontrado.";
}

export default function CheckInScreen() {
  const [checkIn, setCheckIn] = useState<TrainingCheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadCheckIn() {
        try {
          setLoading(true);
          setError("");
          setMessage("");
          const response = await api.getTodayTrainingCheckIn();

          if (isActive) {
            setCheckIn(response);
          }
        } catch (checkInError) {
          if (isActive) {
            if (isNotFoundError(checkInError)) {
              setCheckIn(buildDefaultTodayCheckIn());
            } else {
              setError(checkInError instanceof Error ? checkInError.message : "Não foi possível carregar o check-in.");
            }
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadCheckIn();

      return () => {
        isActive = false;
      };
    }, []),
  );

  async function handleSave(payload: TrainingCheckInPayload) {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await api.saveTodayTrainingCheckIn(payload);
      setMessage("Check-in salvo.");
      router.replace("/home");
    } catch (checkInError) {
      setError(
        isNotFoundError(checkInError)
          ? "A API publicada ainda não está com o check-in disponível. Atualize o deploy do backend e tente novamente."
          : checkInError instanceof Error
            ? checkInError.message
            : "Não foi possível salvar o check-in.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Check-in</Text>
      <Text style={styles.subtitle}>Registre se você treinou hoje e quais atividades fez.</Text>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TrainingCheckInForm checkIn={checkIn} loading={loading} saving={saving} onSave={handleSave} />
    </ScreenContainer>
  );
}

function TrainingCheckInForm({
  checkIn,
  loading,
  saving,
  onSave,
}: {
  checkIn: TrainingCheckIn | null;
  loading: boolean;
  saving: boolean;
  onSave: (payload: TrainingCheckInPayload) => Promise<void>;
}) {
  const [trained, setTrained] = useState(checkIn?.trained ?? false);
  const [activities, setActivities] = useState<TrainingActivity[]>(checkIn?.activities ?? []);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setTrained(checkIn?.trained ?? false);
    setActivities(checkIn?.activities ?? []);
    setValidationError("");
  }, [checkIn]);

  function selectTrained(nextTrained: boolean) {
    setTrained(nextTrained);
    setValidationError("");

    if (!nextTrained) {
      setActivities([]);
    }
  }

  function toggleActivity(activity: TrainingActivity) {
    setValidationError("");
    setActivities((currentActivities) => {
      if (currentActivities.includes(activity)) {
        return currentActivities.filter((currentActivity) => currentActivity !== activity);
      }

      return [...currentActivities, activity];
    });
  }

  async function handleSave() {
    if (trained && activities.length === 0) {
      setValidationError("Selecione pelo menos uma atividade feita hoje.");
      return;
    }

    await onSave({ trained, activities: trained ? activities : [] });
  }

  const statusText = trained
    ? `Hoje você marcou: ${formatTrainingActivities(activities)}`
    : checkIn?.checked_in
      ? "Hoje foi marcado como descanso."
      : "Sem registro hoje. Se nada for salvo, o dia conta como não treinado.";

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.statusIcon, checkIn?.checked_in && styles.statusIconDone]}>
          <Ionicons
            name={checkIn?.checked_in ? "checkmark" : "calendar-outline"}
            size={24}
            color={colors.white}
          />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.cardTitle}>{checkIn?.checked_in ? "Check-in realizado" : "Check-in de hoje"}</Text>
          <Text style={styles.cardText}>{loading ? "Carregando status..." : statusText}</Text>
        </View>
      </View>

      <Text style={styles.question}>Você treinou hoje?</Text>
      <View style={styles.segmentedControl}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: trained }}
          onPress={() => selectTrained(true)}
          style={[styles.segmentButton, trained && styles.segmentButtonActive]}
        >
          <Text style={[styles.segmentText, trained && styles.segmentTextActive]}>Treinei</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !trained }}
          onPress={() => selectTrained(false)}
          style={[styles.segmentButton, !trained && styles.segmentButtonActive]}
        >
          <Text style={[styles.segmentText, !trained && styles.segmentTextActive]}>Não treinei</Text>
        </Pressable>
      </View>

      {trained ? (
        <View>
          <Text style={styles.activitiesLabel}>O que você fez?</Text>
          <View style={styles.activityChips}>
            {trainingActivityOptions.map((activity) => {
              const selected = activities.includes(activity.key);

              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  key={activity.key}
                  onPress={() => toggleActivity(activity.key)}
                  style={[styles.activityChip, selected && styles.activityChipActive]}
                >
                  <Text style={[styles.activityChipText, selected && styles.activityChipTextActive]}>
                    {activity.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {validationError ? <Text style={styles.error}>{validationError}</Text> : null}
      <Button
        title={checkIn?.checked_in ? "Atualizar check-in" : "Salvar check-in"}
        loading={saving}
        onPress={handleSave}
        style={styles.button}
      />
    </Card>
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
    padding: 18,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  statusIcon: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  statusIconDone: {
    backgroundColor: colors.primary,
  },
  headerCopy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 18,
  },
  cardText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
  },
  question: {
    color: colors.title,
    fontFamily: fontFamily.extraBold,
    fontSize: 17,
    marginTop: 22,
  },
  segmentedControl: {
    backgroundColor: "rgba(100, 148, 109, 0.12)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    padding: 5,
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 12,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    color: colors.title,
    fontFamily: fontFamily.extraBold,
    fontSize: 14,
  },
  segmentTextActive: {
    color: colors.white,
  },
  activitiesLabel: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 15,
    marginTop: 18,
  },
  activityChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  activityChip: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activityChipActive: {
    backgroundColor: "rgba(185, 100, 48, 0.12)",
    borderColor: colors.accent,
  },
  activityChipText: {
    color: colors.title,
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
  },
  activityChipTextActive: {
    color: colors.accent,
    fontFamily: fontFamily.extraBold,
  },
  button: {
    marginTop: 18,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
    marginTop: 12,
  },
  message: {
    color: colors.primary,
    fontFamily: fontFamily.extraBold,
    marginBottom: 12,
  },
});
