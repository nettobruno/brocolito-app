import {
  ApiErrorPayload,
  BodyMeasurement,
  LoginResponse,
  MeasurementPayload,
  User,
  WeightGoal,
} from "@/src/types";

const API_BASE_URL = "http://localhost:3000";

let authToken: string | null = null;

export function setApiToken(token: string | null) {
  authToken = token;
}

function buildErrorMessage(payload: ApiErrorPayload | null): string {
  if (!payload) {
    return "Não foi possível completar a solicitação.";
  }

  if (payload.error) {
    return payload.error;
  }

  if (payload.message) {
    return payload.message;
  }

  if (Array.isArray(payload.errors)) {
    return payload.errors.join("\n");
  }

  if (payload.errors && typeof payload.errors === "object") {
    return Object.entries(payload.errors)
      .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
      .join("\n");
  }

  return "Não foi possível completar a solicitação.";
}

function translateErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("can't be blank") || normalized.includes("blank")) {
    return "Preencha todos os campos obrigatórios.";
  }

  if (normalized.includes("has already been taken") || normalized.includes("already")) {
    return "Esse e-mail já está em uso.";
  }

  if (normalized.includes("too short")) {
    return "A senha está muito curta.";
  }

  if (normalized.includes("doesn't match") || normalized.includes("confirmation")) {
    return "A confirmação da senha não confere.";
  }

  if (normalized.includes("invalid") || normalized.includes("unauthorized")) {
    return "E-mail ou senha inválidos.";
  }

  if (normalized.includes("not found")) {
    return "Registro não encontrado.";
  }

  if (normalized.includes("network request failed") || normalized.includes("failed to fetch")) {
    return "Não foi possível conectar à API. Verifique sua internet e tente novamente.";
  }

  return message;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique sua internet e tente novamente.");
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(translateErrorMessage(buildErrorMessage(data)));
  }

  return data as T;
}

export const api = {
  login(email: string, password: string) {
    return request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ authentication: { email, password } }),
    });
  },

  createUser(user: { name: string; email: string; password: string; weight_goal: WeightGoal }) {
    return request<User>("/users", {
      method: "POST",
      body: JSON.stringify({ user }),
    });
  },

  getMe() {
    return request<User>("/users/me");
  },

  updateMe(user: Pick<User, "name" | "email" | "weight_goal">) {
    return request<User>("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ user }),
    });
  },

  updatePassword(payload: {
    current_password?: string;
    password: string;
    password_confirmation: string;
  }) {
    return request<User>("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ user: payload }),
    });
  },

  listMeasurements() {
    return request<BodyMeasurement[]>("/body_measurements");
  },

  createMeasurement(body_measurement: MeasurementPayload) {
    return request<BodyMeasurement>("/body_measurements", {
      method: "POST",
      body: JSON.stringify({ body_measurement }),
    });
  },

  getMeasurement(id: string | number) {
    return request<BodyMeasurement>(`/body_measurements/${id}`);
  },

  updateMeasurement(id: string | number, body_measurement: MeasurementPayload) {
    return request<BodyMeasurement>(`/body_measurements/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ body_measurement }),
    });
  },

  deleteMeasurement(id: string | number) {
    return request<void>(`/body_measurements/${id}`, {
      method: "DELETE",
    });
  },

  compareMeasurements() {
    return request<Record<string, unknown>>("/body_measurements/compare");
  },
};
