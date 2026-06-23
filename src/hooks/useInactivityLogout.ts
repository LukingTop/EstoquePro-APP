import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const TIMEOUT_MINUTOS = 15;
const TIMEOUT_MS = TIMEOUT_MINUTOS * 60 * 1000;

export function useInactivityLogout(): () => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');

  const clearSession = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('loggedUser');
    router.replace('/login');
  };

  const startTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      clearSession();
    }, TIMEOUT_MS);
  };

  const handleAppStateChange = (nextState: AppStateStatus) => {
    if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else if (nextState === 'active' && appStateRef.current.match(/inactive|background/)) {
      startTimer();
    }
    appStateRef.current = nextState;
  };

  useEffect(() => {
    startTimer();
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return startTimer;   
}