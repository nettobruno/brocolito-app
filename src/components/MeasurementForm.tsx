import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { BodyMeasurement, MeasurementPayload } from "@/src/types";
import {
  MeasurementHelp,
  measurementHelpByKey,
  measurementFields,
  measurementToFormValues,
  normalizeMeasurementForm,
} from "@/src/utils/measurements";

type MeasurementFormProps = {
  initialMeasurement?: Partial<BodyMeasurement>;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (payload: MeasurementPayload) => Promise<void> | void;
};

export function MeasurementForm({
  initialMeasurement,
  submitLabel,
  loading = false,
  onSubmit,
}: MeasurementFormProps) {
  const [values, setValues] = useState(measurementToFormValues(initialMeasurement));
  const [selectedHelp, setSelectedHelp] = useState<MeasurementHelp | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setValues(measurementToFormValues(initialMeasurement));
  }, [initialMeasurement]);

  function updateField(key: keyof MeasurementPayload, value: string) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
  }

  async function handleSubmit() {
    const payload = normalizeMeasurementForm(values);

    if (!payload.weight_kg || !payload.height_cm) {
      setError("Preencha peso e altura para salvar a medição.");
      return;
    }

    setError("");
    await onSubmit(payload);
  }

  function renderHelpButton(field: (typeof measurementFields)[number]) {
    return (
      <Pressable
        accessibilityHint={`Abre instruções para preencher ${field.label}.`}
        accessibilityLabel={`Ajuda sobre ${field.label}`}
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => setSelectedHelp(measurementHelpByKey[field.key])}
        style={({ pressed }) => [styles.helpButton, pressed && styles.helpButtonPressed]}
      >
        <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
      </Pressable>
    );
  }

  const visualGuideText =
    selectedHelp?.visualGuide ?? "Imagine a fita reta, nivelada e encostando na pele sem apertar.";

  return (
    <View>
      <Text style={styles.sectionTitle}>Medidas principais</Text>
      {measurementFields.slice(0, 2).map((field) => (
        <Input
          key={field.key}
          label={field.label}
          labelAccessory={renderHelpButton(field)}
          keyboardType="decimal-pad"
          placeholder={field.placeholder}
          value={values[field.key]}
          onChangeText={(value) => updateField(field.key, value)}
        />
      ))}

      <Text style={styles.sectionTitle}>Circunferências</Text>
      {measurementFields.slice(2).map((field) => (
        <Input
          key={field.key}
          label={field.label}
          labelAccessory={renderHelpButton(field)}
          keyboardType="decimal-pad"
          placeholder={field.placeholder}
          value={values[field.key]}
          onChangeText={(value) => updateField(field.key, value)}
        />
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={submitLabel} loading={loading} onPress={handleSubmit} style={styles.button} />

      <Modal
        animationType="slide"
        transparent
        visible={Boolean(selectedHelp)}
        onRequestClose={() => setSelectedHelp(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityLabel="Fechar instruções"
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedHelp(null)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIcon}>
                <Ionicons name="body-outline" size={24} color={colors.accent} />
              </View>
              <View style={styles.sheetTitleBlock}>
                <Text style={styles.sheetEyebrow}>Guia de medida</Text>
                <Text style={styles.sheetTitle}>{selectedHelp?.title}</Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => setSelectedHelp(null)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.helpButtonPressed]}
              >
                <Ionicons name="close" size={22} color={colors.title} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <Text style={styles.sheetSummary}>{selectedHelp?.summary}</Text>
              <View style={styles.visualGuide}>
                <Ionicons name="resize-outline" size={26} color={colors.primary} />
                <Text style={styles.visualGuideText}>{visualGuideText}</Text>
              </View>
              {selectedHelp?.steps.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
              <View style={styles.tipBox}>
                <Ionicons name="alert-circle-outline" size={20} color={colors.accent} />
                <Text style={styles.tipText}>{selectedHelp?.tip}</Text>
              </View>
              <Button title="Entendi" onPress={() => setSelectedHelp(null)} style={styles.modalButton} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    marginBottom: 12,
    marginTop: 12,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  helpButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  helpButtonPressed: {
    opacity: 0.65,
  },
  modalBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "86%",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    borderRadius: 999,
    height: 4,
    marginBottom: 16,
    width: 44,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  sheetIcon: {
    alignItems: "center",
    backgroundColor: "rgba(185, 100, 48, 0.12)",
    borderRadius: 999,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  sheetTitleBlock: {
    flex: 1,
  },
  sheetEyebrow: {
    color: colors.accent,
    fontFamily: fontFamily.extraBold,
    fontSize: 12,
  },
  sheetTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    marginTop: 2,
  },
  closeButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  sheetContent: {
    paddingBottom: 24,
    paddingTop: 16,
  },
  sheetSummary: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  visualGuide: {
    alignItems: "center",
    backgroundColor: "rgba(100, 148, 109, 0.12)",
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    padding: 14,
  },
  visualGuideText: {
    color: colors.title,
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  stepNumber: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  stepNumberText: {
    color: colors.white,
    fontFamily: fontFamily.extraBold,
    fontSize: 13,
  },
  stepText: {
    color: colors.title,
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  tipBox: {
    alignItems: "flex-start",
    backgroundColor: "rgba(185, 100, 48, 0.1)",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    padding: 14,
  },
  tipText: {
    color: colors.title,
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  modalButton: {
    marginTop: 18,
  },
});
