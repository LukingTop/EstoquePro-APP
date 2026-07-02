// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COR_PRIMARIA = '#4c1d95';
const COR_INATIVA = '#94a3b8';
const COR_FUNDO_TAB = '#FFFFFF';

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COR_PRIMARIA,
          tabBarInactiveTintColor: COR_INATIVA,
          tabBarStyle: {
            backgroundColor: COR_FUNDO_TAB,
            borderTopColor: '#E2E8F0',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="inicio"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ciclos"
          options={{
            title: 'Ciclos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="sync-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="relatorios"
          options={{
            title: 'Relatórios',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="config"
          options={{
            title: 'Config.',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}