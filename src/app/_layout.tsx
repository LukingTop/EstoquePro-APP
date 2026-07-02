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

  const resetInactivity = useInactivityLogout();

  const handleTouch = useCallback(() => {
    resetInactivity();
  }, [resetInactivity]);

  useEffect(() => {
    registerBackgroundSync();
  }, []);

  return (
    <VersionGuard>
      <ErrorBoundary>
        <MonitoramentoBateria />
        <TouchCapture onTouch={handleTouch}>
          <Stack screenOptions={{ headerShown: false }}>
          </Stack>
        </TouchCapture>
      </ErrorBoundary>
    </VersionGuard>
  );
}