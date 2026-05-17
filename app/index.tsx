import { router } from "expo-router";
import { useEffect } from "react";

import { Logo } from "@/src/components/Logo";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { useAuth } from "@/src/context/AuthContext";

export default function Index() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    const timeout = setTimeout(() => {
      router.replace(isAuthenticated ? "/home" : "/onboarding");
    }, 900);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isBootstrapping]);

  return (
    <ScreenContainer scroll={false} centered>
      <Logo size={168} />
    </ScreenContainer>
  );
}
