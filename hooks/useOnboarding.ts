import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

const ONBOARDING_KEY = "skole-onboarding-done";

export interface UseOnboardingReturn {
  done: boolean;
  isLoading: boolean;
  markDone: () => Promise<void>;
}

export function useOnboarding(): UseOnboardingReturn {
  const [done, setDone] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      try {
        const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
        if (isMounted) {
          setDone(value === "true");
        }
      } catch {
        if (isMounted) {
          setDone(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const markDone = useCallback(async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
      setDone(true);
    } catch {
      // In case SecureStore throws on unsupported environment, update state
      setDone(true);
    }
  }, []);

  return {
    done,
    isLoading,
    markDone,
  };
}
