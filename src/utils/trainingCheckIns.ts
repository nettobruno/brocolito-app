import { TrainingActivity } from "@/src/types";

export const trainingActivityOptions: {
  key: TrainingActivity;
  label: string;
}[] = [
  { key: "strength", label: "Musculação" },
  { key: "cardio", label: "Cardio" },
  { key: "pilates", label: "Pilates" },
  { key: "muay_thai", label: "Muay thai" },
  { key: "running", label: "Corrida" },
  { key: "walking", label: "Caminhada" },
  { key: "other", label: "Outro" },
];

export function formatTrainingActivities(activities: TrainingActivity[]) {
  if (activities.length === 0) {
    return "Nenhuma atividade registrada.";
  }

  const labels = activities.map((activity) => {
    return trainingActivityOptions.find((option) => option.key === activity)?.label ?? activity;
  });

  return labels.join(", ");
}
