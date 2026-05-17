import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { BodyMeasurement, MeasurementPayload } from "@/src/types";
import {
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

  return (
    <View>
      <Text style={styles.sectionTitle}>Medidas principais</Text>
      {measurementFields.slice(0, 2).map((field) => (
        <Input
          key={field.key}
          label={field.label}
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
          keyboardType="decimal-pad"
          placeholder={field.placeholder}
          value={values[field.key]}
          onChangeText={(value) => updateField(field.key, value)}
        />
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={submitLabel} loading={loading} onPress={handleSubmit} style={styles.button} />
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
});
