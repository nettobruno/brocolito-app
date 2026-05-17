import { BodyMeasurement, MeasurementPayload } from "@/src/types";

export const measurementFields: {
  key: keyof MeasurementPayload;
  label: string;
  shortLabel: string;
  placeholder: string;
}[] = [
  { key: "weight_kg", label: "Peso", shortLabel: "Peso", placeholder: "kg" },
  { key: "height_cm", label: "Altura", shortLabel: "Altura", placeholder: "cm" },
  { key: "neck_circumference_cm", label: "Pescoço", shortLabel: "Pescoço", placeholder: "cm" },
  { key: "chest_circumference_cm", label: "Peito", shortLabel: "Peito", placeholder: "cm" },
  { key: "shoulder_circumference_cm", label: "Ombro", shortLabel: "Ombro", placeholder: "cm" },
  { key: "waist_circumference_cm", label: "Cintura", shortLabel: "Cintura", placeholder: "cm" },
  { key: "hip_circumference_cm", label: "Quadril", shortLabel: "Quadril", placeholder: "cm" },
  { key: "abdomen_circumference_cm", label: "Abdômen", shortLabel: "Abdômen", placeholder: "cm" },
  { key: "relaxed_arm_circumference_cm", label: "Braço relaxado", shortLabel: "Braço relax.", placeholder: "cm" },
  { key: "flexed_arm_circumference_cm", label: "Braço flexionado", shortLabel: "Braço flex.", placeholder: "cm" },
  { key: "forearm_circumference_cm", label: "Antebraço", shortLabel: "Antebraço", placeholder: "cm" },
  { key: "thigh_circumference_cm", label: "Coxa", shortLabel: "Coxa", placeholder: "cm" },
  { key: "calf_circumference_cm", label: "Panturrilha", shortLabel: "Panturrilha", placeholder: "cm" },
];

export function normalizeMeasurementForm(
  values: Record<keyof MeasurementPayload, string>,
): MeasurementPayload {
  return measurementFields.reduce<MeasurementPayload>((payload, field) => {
    const rawValue = values[field.key]?.replace(",", ".").trim();

    if (rawValue) {
      const parsed = Number(rawValue);

      if (!Number.isNaN(parsed)) {
        payload[field.key] = parsed;
      }
    }

    return payload;
  }, {});
}

export function measurementToFormValues(
  measurement?: Partial<BodyMeasurement>,
): Record<keyof MeasurementPayload, string> {
  return measurementFields.reduce<Record<keyof MeasurementPayload, string>>(
    (values, field) => {
      const value = measurement?.[field.key];
      values[field.key] = value == null ? "" : String(value);
      return values;
    },
    {} as Record<keyof MeasurementPayload, string>,
  );
}

export function formatMeasurementDate(measurement: BodyMeasurement): string {
  const date = measurement.created_at ?? measurement.updated_at;

  if (!date) {
    return "Data não informada";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

export function formatNumber(value?: number | null, suffix = ""): string {
  if (value == null) {
    return "-";
  }

  return `${Number(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })}${suffix}`;
}

export function getLatestMeasurement(measurements: BodyMeasurement[]) {
  return [...measurements].sort((first, second) => {
    const firstTime = new Date(first.created_at ?? first.updated_at ?? 0).getTime();
    const secondTime = new Date(second.created_at ?? second.updated_at ?? 0).getTime();

    if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) {
      return second.id - first.id;
    }

    return secondTime - firstTime;
  })[0];
}
