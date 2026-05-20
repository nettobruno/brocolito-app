export type WeightGoal = "lose_weight" | "gain_weight";

export type TrainingActivity =
  | "strength"
  | "cardio"
  | "pilates"
  | "muay_thai"
  | "running"
  | "walking"
  | "other";

export type User = {
  id: number;
  name: string;
  email: string;
  weight_goal: WeightGoal;
};

export type BodyMeasurement = {
  id: number;
  weight_kg?: number | null;
  height_cm?: number | null;
  neck_circumference_cm?: number | null;
  chest_circumference_cm?: number | null;
  shoulder_circumference_cm?: number | null;
  waist_circumference_cm?: number | null;
  hip_circumference_cm?: number | null;
  abdomen_circumference_cm?: number | null;
  relaxed_arm_circumference_cm?: number | null;
  flexed_arm_circumference_cm?: number | null;
  forearm_circumference_cm?: number | null;
  thigh_circumference_cm?: number | null;
  calf_circumference_cm?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type MeasurementPayload = Omit<
  BodyMeasurement,
  "id" | "created_at" | "updated_at"
>;

export type TrainingCheckIn = {
  id?: number;
  user_id?: number;
  date: string;
  trained: boolean;
  activities: TrainingActivity[];
  notes?: string | null;
  checked_in?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type TrainingCheckInPayload = {
  trained: boolean;
  activities: TrainingActivity[];
  notes?: string | null;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type ApiErrorPayload = {
  error?: string;
  errors?: string[] | Record<string, string[]>;
  message?: string;
};
