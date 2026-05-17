import { BodyMeasurement, WeightGoal } from "@/src/types";
import { formatNumber } from "@/src/utils/measurements";

const supportedInsightKeys = new Set([
  "weight_change_kg",
  "waist_circumference_change_cm",
  "abdomen_circumference_change_cm",
]);

function orderedMeasurements(measurements: BodyMeasurement[]) {
  return [...measurements].sort((first, second) => {
    const firstTime = new Date(first.created_at ?? first.updated_at ?? 0).getTime();
    const secondTime = new Date(second.created_at ?? second.updated_at ?? 0).getTime();

    if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) {
      return first.id - second.id;
    }

    return firstTime - secondTime;
  });
}

function firstAndLastWeight(measurements: BodyMeasurement[]) {
  const weightMeasurements = orderedMeasurements(measurements).filter(
    (measurement) => measurement.weight_kg != null,
  );

  if (weightMeasurements.length < 2) {
    return null;
  }

  return {
    first: Number(weightMeasurements[0].weight_kg),
    last: Number(weightMeasurements[weightMeasurements.length - 1].weight_kg),
  };
}

function weightChangePercent(measurements: BodyMeasurement[]) {
  const weights = firstAndLastWeight(measurements);

  if (!weights || weights.first <= 0) {
    return null;
  }

  return Math.abs(((weights.last - weights.first) / weights.first) * 100);
}

export function hasHealthInsight(key: string, value: unknown) {
  const numericValue = Number(value);

  return supportedInsightKeys.has(key) && !Number.isNaN(numericValue) && numericValue !== 0;
}

function buildWeightInsight(goal: WeightGoal | null | undefined, change: number, measurements: BodyMeasurement[]) {
  const absoluteChange = Math.abs(change);
  const percent = weightChangePercent(measurements);
  const percentText = percent ? `, cerca de ${formatNumber(percent, "%")} do peso inicial` : "";

  if (goal === "lose_weight") {
    if (change < 0) {
      return {
        title: "Peso caminhando com seu objetivo",
        text: `Você reduziu ${formatNumber(absoluteChange, " kg")}${percentText}. Para quem quer perder peso, esse tipo de mudança pode ajudar indicadores como pressão, colesterol e glicose quando acontece de forma gradual e com bons hábitos. Observe se sua energia, sono e rotina também estão acompanhando essa evolução.`,
      };
    }

    return {
      title: "Peso acima da direção planejada",
      text: `Seu peso subiu ${formatNumber(absoluteChange, " kg")}. Isso não apaga seu progresso: retenção de líquido, horário da pesagem, alimentação recente e treino podem mexer no número. Se a tendência continuar, use esse sinal para ajustar rotina, porções, sono e frequência de atividade física com calma.`,
    };
  }

  if (change > 0) {
    return {
      title: "Peso caminhando com seu objetivo",
      text: `Você ganhou ${formatNumber(absoluteChange, " kg")}${percentText}. Para quem quer ganhar peso, o ideal é que esse aumento venha junto de força, disposição e medidas sob controle. Acompanhe cintura e abdômen para entender se o ganho parece mais equilibrado para o seu plano.`,
    };
  }

  return {
    title: "Peso abaixo da direção planejada",
    text: `Seu peso caiu ${formatNumber(absoluteChange, " kg")}. Para quem quer ganhar peso, isso pode indicar que a ingestão, recuperação ou treino não estão sustentando o objetivo no momento. Vale revisar refeições, proteína, descanso e evolução de força antes de mudar tudo de uma vez.`,
  };
}

function buildWaistInsight(goal: WeightGoal | null | undefined, change: number) {
  const absoluteChange = Math.abs(change);

  if (goal === "lose_weight") {
    if (change < 0) {
      return {
        title: "Cintura em boa direção",
        text: `Sua cintura reduziu ${formatNumber(absoluteChange, " cm")}. Para quem busca perder peso, essa medida costuma ser especialmente útil porque acompanha gordura abdominal, que se relaciona a risco cardiometabólico. É um bom sinal para olhar junto com peso, energia e consistência da rotina.`,
      };
    }

    return {
      title: "Cintura pede atenção",
      text: `Sua cintura subiu ${formatNumber(absoluteChange, " cm")}. Para o objetivo de perder peso, acompanhar essa tendência é importante, porque a cintura ajuda a observar mudanças na região abdominal. Uma medida isolada pode variar; se repetir, vale revisar alimentação, álcool, sono, estresse e atividade física.`,
    };
  }

  if (change < 0) {
    return {
      title: "Ganho com cintura mais controlada",
      text: `Sua cintura reduziu ${formatNumber(absoluteChange, " cm")}. Para quem quer ganhar peso, isso pode ser um bom sinal se o peso ou a força estiverem subindo, porque sugere um ganho mais controlado na região abdominal. Compare com treino, medidas de braço/coxa e evolução de carga.`,
    };
  }

  return {
    title: "Cintura subiu junto do ganho",
    text: `Sua cintura subiu ${formatNumber(absoluteChange, " cm")}. Para quem quer ganhar peso, algum aumento pode acontecer, mas essa medida ajuda a perceber se o ganho está concentrando demais na região abdominal. Pode valer ajustar o ritmo de ganho e reforçar treino de força.`,
  };
}

function buildAbdomenInsight(goal: WeightGoal | null | undefined, change: number) {
  const absoluteChange = Math.abs(change);

  if (goal === "lose_weight") {
    if (change < 0) {
      return {
        title: "Abdômen reduzindo",
        text: `Seu abdômen reduziu ${formatNumber(absoluteChange, " cm")}. Para quem quer perder peso, essa queda pode indicar melhora na composição corporal, principalmente quando aparece junto de redução de cintura e hábitos mais consistentes. Continue olhando a tendência, não só uma medição isolada.`,
      };
    }

    return {
      title: "Abdômen fora da direção esperada",
      text: `Seu abdômen subiu ${formatNumber(absoluteChange, " cm")}. Para o objetivo de perder peso, isso merece observação, mas não precisa virar culpa. Digestão, retenção, postura e horário da medida podem influenciar. Se o padrão continuar, revise rotina alimentar, sono e regularidade dos treinos.`,
    };
  }

  if (change < 0) {
    return {
      title: "Abdômen mais controlado",
      text: `Seu abdômen reduziu ${formatNumber(absoluteChange, " cm")}. Para quem quer ganhar peso, isso pode ser positivo se outras medidas ou a força estiverem evoluindo, porque sugere que o ganho não está se concentrando na região abdominal. Vale comparar com peso, cintura e desempenho no treino.`,
    };
  }

  return {
    title: "Abdômen acompanhando o ganho",
    text: `Seu abdômen subiu ${formatNumber(absoluteChange, " cm")}. Para quem quer ganhar peso, acompanhe se esse aumento está vindo junto de força e outras medidas, ou se está concentrado no tronco. Essa leitura ajuda a ajustar calorias, treino e ritmo de evolução sem pressa.`,
  };
}

export function buildHealthInsight({
  goal,
  key,
  measurements,
  value,
}: {
  goal?: WeightGoal | null;
  key: string;
  measurements: BodyMeasurement[];
  value: unknown;
}) {
  if (!hasHealthInsight(key, value)) {
    return null;
  }

  const change = Number(value);

  if (key === "weight_change_kg") {
    return buildWeightInsight(goal, change, measurements);
  }

  if (key === "waist_circumference_change_cm") {
    return buildWaistInsight(goal, change);
  }

  return buildAbdomenInsight(goal, change);
}
