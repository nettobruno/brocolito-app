import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/src/components/Card";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { TrainingCheckIn } from "@/src/types";
import { formatTrainingActivities } from "@/src/utils/trainingCheckIns";

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type CalendarDay = {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index): CalendarDay => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      dateKey: toDateKey(date),
      inCurrentMonth: date.getMonth() === month,
    };
  });
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${dateKey}T00:00:00`));
}

export default function CheckInCalendarScreen() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [checkIns, setCheckIns] = useState<TrainingCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const monthStart = useMemo(
    () => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1),
    [visibleMonth],
  );
  const monthEnd = useMemo(
    () => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0),
    [visibleMonth],
  );

  const loadCheckIns = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.listTrainingCheckIns({
        startDate: toDateKey(monthStart),
        endDate: toDateKey(monthEnd),
      });
      setCheckIns(response);
    } catch (calendarError) {
      setError(calendarError instanceof Error ? calendarError.message : "Não foi possível carregar o calendário.");
    } finally {
      setLoading(false);
    }
  }, [monthEnd, monthStart]);

  useFocusEffect(
    useCallback(() => {
      loadCheckIns();
    }, [loadCheckIns]),
  );

  const checkInsByDate = useMemo(() => {
    return new Map(checkIns.map((checkIn) => [checkIn.date, checkIn]));
  }, [checkIns]);
  const days = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);
  const trainedCount = checkIns.filter((checkIn) => checkIn.trained).length;
  const restCount = checkIns.length - trainedCount;

  function changeMonth(offset: number) {
    setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Calendário</Text>
          <Text style={styles.subtitle}>Dias em que você registrou check-in.</Text>
        </View>
      </View>

      <Card style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <Pressable
            accessibilityLabel="Mês anterior"
            accessibilityRole="button"
            onPress={() => changeMonth(-1)}
            style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.title} />
          </Pressable>
          <Text style={styles.monthTitle}>{formatMonthTitle(visibleMonth)}</Text>
          <Pressable
            accessibilityLabel="Próximo mês"
            accessibilityRole="button"
            onPress={() => changeMonth(1)}
            style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-forward" size={22} color={colors.title} />
          </Pressable>
        </View>

        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.weekdays}>
          {weekdays.map((weekday) => (
            <Text key={weekday} style={styles.weekday}>
              {weekday}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days.map((day) => {
            const checkIn = checkInsByDate.get(day.dateKey);
            const isToday = day.dateKey === toDateKey(new Date());
            const hasCheckIn = Boolean(checkIn);

            return (
              <View
                key={day.dateKey}
                style={[
                  styles.dayCell,
                  !day.inCurrentMonth && styles.dayCellMuted,
                  isToday && styles.dayCellToday,
                  hasCheckIn && styles.dayCellChecked,
                  checkIn?.trained && styles.dayCellTrained,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !day.inCurrentMonth && styles.dayTextMuted,
                    checkIn?.trained && styles.dayTextTrained,
                  ]}
                >
                  {day.date.getDate()}
                </Text>
                {hasCheckIn ? <View style={[styles.checkDot, checkIn?.trained && styles.checkDotTrained]} /> : null}
              </View>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotTrained]} />
            <Text style={styles.legendText}>Treino</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Descanso registrado</Text>
          </View>
        </View>
      </Card>

      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{checkIns.length}</Text>
          <Text style={styles.summaryLabel}>check-ins</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{trainedCount}</Text>
          <Text style={styles.summaryLabel}>treinos</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{restCount}</Text>
          <Text style={styles.summaryLabel}>descansos</Text>
        </Card>
      </View>

      {!loading && checkIns.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhum check-in neste mês.</Text>
          <Text style={styles.emptyText}>Quando você salvar um check-in, o dia aparece marcado aqui.</Text>
        </Card>
      ) : null}

      <View style={styles.list}>
        {checkIns.map((checkIn) => (
          <Card key={checkIn.date} style={styles.checkInItem}>
            <View style={styles.checkInItemHeader}>
              <Text style={styles.checkInDate}>{formatDateLabel(checkIn.date)}</Text>
              <Text style={[styles.checkInStatus, checkIn.trained && styles.checkInStatusTrained]}>
                {checkIn.trained ? "Treino" : "Descanso"}
              </Text>
            </View>
            <Text style={styles.checkInActivities}>
              {checkIn.trained ? formatTrainingActivities(checkIn.activities) : "Descanso registrado."}
            </Text>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
  },
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
    marginTop: 4,
  },
  calendarCard: {
    padding: 14,
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  monthButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  monthTitle: {
    color: colors.title,
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    textAlign: "center",
    textTransform: "capitalize",
  },
  loader: {
    marginBottom: 12,
  },
  weekdays: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekday: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: fontFamily.extraBold,
    fontSize: 12,
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    alignItems: "center",
    aspectRatio: 1,
    borderColor: "transparent",
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    marginVertical: 3,
    width: `${100 / 7}%`,
  },
  dayCellMuted: {
    opacity: 0.36,
  },
  dayCellToday: {
    borderColor: colors.accent,
  },
  dayCellChecked: {
    backgroundColor: "rgba(100, 148, 109, 0.16)",
    borderColor: "rgba(100, 148, 109, 0.42)",
  },
  dayCellTrained: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 15,
  },
  dayTextMuted: {
    color: colors.textMuted,
  },
  dayTextTrained: {
    color: colors.white,
  },
  checkDot: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 5,
    marginTop: 4,
    width: 5,
  },
  checkDotTrained: {
    backgroundColor: colors.white,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 16,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  legendDot: {
    backgroundColor: "rgba(100, 148, 109, 0.28)",
    borderColor: "rgba(100, 148, 109, 0.42)",
    borderRadius: 999,
    borderWidth: 1,
    height: 12,
    width: 12,
  },
  legendDotTrained: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  legendText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  summaryCard: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 14,
  },
  summaryValue: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 24,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    textAlign: "center",
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center",
  },
  list: {
    gap: 10,
    marginTop: 14,
  },
  checkInItem: {
    padding: 14,
  },
  checkInItemHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  checkInDate: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 16,
  },
  checkInStatus: {
    color: colors.accent,
    fontFamily: fontFamily.extraBold,
    fontSize: 13,
  },
  checkInStatusTrained: {
    color: colors.primary,
  },
  checkInActivities: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    lineHeight: 20,
    marginTop: 6,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.75,
  },
});
