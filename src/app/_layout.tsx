import { useCallback, useEffect } from 'react';
import { Stack } from "expo-router";
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAppUpdates } from '@/hooks/useAppUpdates';
import MonitoramentoBateria from '@/components/MonitoramentoBateria';
import ErrorBoundary from '@/components/ErrorBoundary';
import TouchCapture from '@/components/TouchCapture';
import VersionGuard from '@/components/VersionGuard';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { registerBackgroundSync } from '@/services/backgroundSync';

export default function Layout() {
  usePushNotifications();
  useAppUpdates();

  // Obtém a função que reseta o timer de inatividade
  const resetInactivity = useInactivityLogout();

  const handleTouch = useCallback(() => {
    resetInactivity();
  }, [resetInactivity]);

  // Ativa a sincronização automática em segundo plano
  useEffect(() => {
    registerBackgroundSync();
  }, []);

  return (
    <VersionGuard>
      <ErrorBoundary>
        <MonitoramentoBateria />
        <TouchCapture onTouch={handleTouch}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ title: "Nova Contagem" }} />
            <Stack.Screen name="lista" options={{ title: "Histórico Diário" }} />
            <Stack.Screen name="missoes" options={{ title: "Missões de Recontagem" }} />
          </Stack>
        </TouchCapture>
      </ErrorBoundary>
    </VersionGuard>
  );
}