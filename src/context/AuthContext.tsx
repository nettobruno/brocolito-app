import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api, setApiToken } from "@/src/services/api";
import { User, WeightGoal } from "@/src/types";

const TOKEN_STORAGE_KEY = "@brocolito/token";
const USER_STORAGE_KEY = "@brocolito/user";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: {
    name: string;
    email: string;
    password: string;
    weight_goal: WeightGoal;
  }) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(USER_STORAGE_KEY),
        ]);

        if (storedToken) {
          setToken(storedToken);
          setApiToken(storedToken);

          try {
            const currentUser = await api.getMe();
            setUser(currentUser);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
            return;
          } catch {
            setApiToken(null);
            setToken(null);
            await Promise.all([
              AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
              AsyncStorage.removeItem(USER_STORAGE_KEY),
            ]);
          }
        } else if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrap();
  }, []);

  const persistSession = useCallback(async (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    setApiToken(nextToken);

    await Promise.all([
      AsyncStorage.setItem(TOKEN_STORAGE_KEY, nextToken),
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser)),
    ]);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    await persistSession(response.token, response.user);
  }, [persistSession]);

  const signUp = useCallback(async (payload: {
    name: string;
    email: string;
    password: string;
    weight_goal: WeightGoal;
  }) => {
    await api.createUser(payload);
    await signIn(payload.email, payload.password);
  }, [signIn]);

  const updateUser = useCallback(async (nextUser: User) => {
    setUser(nextUser);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    setApiToken(null);
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
      AsyncStorage.removeItem(USER_STORAGE_KEY),
    ]);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isBootstrapping,
      isAuthenticated: Boolean(token),
      signIn,
      signUp,
      updateUser,
      signOut,
    }),
    [isBootstrapping, signIn, signOut, signUp, token, updateUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
