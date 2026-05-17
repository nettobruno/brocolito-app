import { BodyMeasurement, WeightGoal } from "@/src/types";
import { formatNumber } from "@/src/utils/measurements";

export const weightGoalOptions: { value: WeightGoal; label: string; description: string }[] = [
  {
    value: "lose_weight",
    label: "Perder peso",
    description: "Quero reduzir meu peso atual.",
  },
  {
    value: "gain_weight",
    label: "Ganhar peso",
    description: "Quero aumentar meu peso atual.",
  },
];

export function weightGoalLabel(goal?: WeightGoal | null) {
  return weightGoalOptions.find((option) => option.value === goal)?.label ?? "Objetivo não definido";
}

function comparableWeightMeasurements(measurements: BodyMeasurement[]) {
  return [...measurements]
    .filter((measurement) => measurement.weight_kg != null)
    .sort((first, second) => {
      const firstTime = new Date(first.created_at ?? first.updated_at ?? 0).getTime();
      const secondTime = new Date(second.created_at ?? second.updated_at ?? 0).getTime();

      if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) {
        return first.id - second.id;
      }

      return firstTime - secondTime;
    });
}

function formatElapsedTime(first: BodyMeasurement, last: BodyMeasurement) {
  const firstDate = new Date(first.created_at ?? first.updated_at ?? 0);
  const lastDate = new Date(last.created_at ?? last.updated_at ?? 0);

  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(lastDate.getTime())) {
    return "nesse período";
  }

  const days = Math.max(
    1,
    Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  if (days < 30) {
    return `em ${days} ${days === 1 ? "dia" : "dias"}`;
  }

  const months = Math.max(1, Math.round(days / 30));
  return `em ${months} ${months === 1 ? "mês" : "meses"}`;
}

export function buildWeightGoalProgressMessage(
  goal: WeightGoal | null | undefined,
  measurements: BodyMeasurement[],
) {
  const comparableMeasurements = comparableWeightMeasurements(measurements);

  if (!goal || comparableMeasurements.length < 2) {
    return null;
  }

  const first = comparableMeasurements[0];
  const last = comparableMeasurements[comparableMeasurements.length - 1];
  const firstWeight = Number(first.weight_kg);
  const lastWeight = Number(last.weight_kg);
  const change = lastWeight - firstWeight;
  const absoluteChange = Math.abs(change);
  const elapsedTime = formatElapsedTime(first, last);

  if (absoluteChange === 0) {
    return {
      title: "Peso estável",
      text: `Seu peso se manteve estável ${elapsedTime}. Continue registrando suas medições para acompanhar melhor seu objetivo.`,
    };
  }

  if (goal === "lose_weight" && change < 0) {
    return {
      title: "Você está no caminho",
      text: `Parabéns, você perdeu ${formatNumber(absoluteChange, " kg")} ${elapsedTime}.`,
    };
  }

  if (goal === "gain_weight" && change > 0) {
    return {
      title: "Você está no caminho",
      text: `Parabéns, você ganhou ${formatNumber(absoluteChange, " kg")} ${elapsedTime}.`,
    };
  }

  if (goal === "lose_weight") {
    return {
      title: "Hora de ajustar a rota",
      text: `Seu peso subiu ${formatNumber(absoluteChange, " kg")} ${elapsedTime}. Isso pode acontecer; vale revisar sua rotina com calma e seguir acompanhando.`,
    };
  }

  return {
    title: "Hora de ajustar a rota",
    text: `Seu peso caiu ${formatNumber(absoluteChange, " kg")} ${elapsedTime}. Isso pode acontecer; vale revisar sua rotina com calma e seguir acompanhando.`,
  };
}
