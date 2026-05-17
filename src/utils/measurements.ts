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

export type MeasurementHelp = {
  title: string;
  summary: string;
  steps: string[];
  tip: string;
  visualGuide?: string;
};

export const measurementHelpByKey: Record<keyof MeasurementPayload, MeasurementHelp> = {
  weight_kg: {
    title: "Como registrar o peso",
    summary: "Use sempre uma condição parecida para comparar sua evolução com mais precisão.",
    steps: [
      "Pese-se de preferência pela manhã, após ir ao banheiro.",
      "Use a mesma balança e deixe-a em uma superfície firme.",
      "Evite comparar pesos medidos em horários muito diferentes do dia.",
    ],
    tip: "Variações pequenas de um dia para o outro são comuns por hidratação, alimentação e retenção.",
    visualGuide: "Suba na balança parado, com os pés apoiados e o peso distribuído dos dois lados.",
  },
  height_cm: {
    title: "Como medir a altura",
    summary: "Fique em pé, alinhado, para que a medida não fique menor ou maior que o real.",
    steps: [
      "Encoste calcanhares, costas e cabeça em uma parede reta, se possível.",
      "Olhe para frente e mantenha os pés paralelos.",
      "Marque o topo da cabeça e meça do chão até a marca.",
    ],
    tip: "Meça descalço e sem boné, coque ou acessórios no topo da cabeça.",
    visualGuide: "Use uma parede reta como referência e mantenha o corpo alinhado dos pés à cabeça.",
  },
  neck_circumference_cm: {
    title: "Como medir o pescoço",
    summary: "A fita deve contornar o pescoço sem apertar a pele.",
    steps: [
      "Passe a fita ao redor da parte mais baixa do pescoço.",
      "Mantenha a cabeça olhando para frente e os ombros relaxados.",
      "Deixe a fita nivelada e justa, mas confortável.",
    ],
    tip: "Não prenda a respiração durante a medição.",
  },
  chest_circumference_cm: {
    title: "Como medir o peito",
    summary: "Meça na linha mais cheia do peito, mantendo a fita reta nas costas.",
    steps: [
      "Passe a fita ao redor do tronco, na altura dos mamilos.",
      "Relaxe os braços ao lado do corpo.",
      "Respire normalmente e anote a medida sem estufar o peito.",
    ],
    tip: "Use um espelho ou peça ajuda para manter a fita horizontal nas costas.",
  },
  shoulder_circumference_cm: {
    title: "Como medir o ombro",
    summary: "A medida do ombro contorna a parte mais larga da região superior do tronco.",
    steps: [
      "Passe a fita ao redor dos ombros e da parte alta do peito.",
      "Mantenha os braços relaxados e a postura natural.",
      "Confira se a fita não escorregou nas costas.",
    ],
    tip: "Essa é uma medida mais difícil sozinho; se puder, peça ajuda.",
  },
  waist_circumference_cm: {
    title: "Como medir a cintura",
    summary: "A cintura costuma ser medida na parte mais estreita do tronco.",
    steps: [
      "Fique em pé e relaxe o abdômen.",
      "Passe a fita na região mais estreita entre as costelas e o quadril.",
      "Mantenha a fita paralela ao chão e anote após soltar o ar normalmente.",
    ],
    tip: "Evite puxar a fita para dentro da pele; ela deve encostar sem apertar.",
  },
  hip_circumference_cm: {
    title: "Como medir o quadril",
    summary: "Meça a parte mais larga do quadril e dos glúteos.",
    steps: [
      "Fique com os pés juntos ou levemente afastados.",
      "Passe a fita pela área mais volumosa do quadril.",
      "Confira no espelho se a fita está reta na frente e atrás.",
    ],
    tip: "Use sempre o mesmo ponto de referência para comparar medidas futuras.",
  },
  abdomen_circumference_cm: {
    title: "Como medir o abdômen",
    summary: "O abdômen é medido na região da barriga, geralmente na altura do umbigo.",
    steps: [
      "Fique em pé, com a postura natural.",
      "Passe a fita ao redor do corpo na altura do umbigo.",
      "Relaxe a barriga e anote a medida ao final de uma expiração normal.",
    ],
    tip: "Não encolha nem empurre a barriga para frente durante a medida.",
  },
  relaxed_arm_circumference_cm: {
    title: "Como medir o braço relaxado",
    summary: "Meça o braço sem contrair, no ponto mais largo.",
    steps: [
      "Deixe o braço solto ao lado do corpo.",
      "Passe a fita no ponto mais largo entre ombro e cotovelo.",
      "Mantenha a fita firme, mas sem comprimir o braço.",
    ],
    tip: "Registre sempre o mesmo braço ou anote se alternar entre direito e esquerdo.",
  },
  flexed_arm_circumference_cm: {
    title: "Como medir o braço flexionado",
    summary: "Essa medida acompanha o braço contraído, no maior volume do bíceps.",
    steps: [
      "Dobre o cotovelo e contraia o braço.",
      "Passe a fita ao redor da parte mais larga do bíceps.",
      "Evite inclinar a fita ou apertar demais.",
    ],
    tip: "Tente repetir sempre a mesma posição do braço nas próximas medições.",
  },
  forearm_circumference_cm: {
    title: "Como medir o antebraço",
    summary: "Meça a parte mais larga do antebraço com o braço relaxado.",
    steps: [
      "Estenda o braço de forma confortável.",
      "Passe a fita no ponto mais largo entre cotovelo e punho.",
      "Mantenha a mão relaxada para não alterar a medida.",
    ],
    tip: "A fita deve tocar a pele sem deixar marca.",
  },
  thigh_circumference_cm: {
    title: "Como medir a coxa",
    summary: "A coxa deve ser medida em um ponto consistente, de preferência o mais largo.",
    steps: [
      "Fique em pé com o peso distribuído entre as duas pernas.",
      "Passe a fita na parte mais larga da coxa.",
      "Mantenha a fita reta e anote sem contrair a perna.",
    ],
    tip: "Meça sempre a mesma perna para acompanhar a tendência.",
  },
  calf_circumference_cm: {
    title: "Como medir a panturrilha",
    summary: "Meça a parte mais larga da panturrilha com a perna relaxada.",
    steps: [
      "Fique em pé ou sentado com o pé apoiado no chão.",
      "Passe a fita ao redor do ponto mais largo da panturrilha.",
      "Confira se a fita está nivelada antes de anotar.",
    ],
    tip: "Use sempre a mesma perna e a mesma posição nas próximas medições.",
  },
};

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
