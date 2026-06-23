import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function MonitoramentoBateria() {
  const [bateriaBaixa, setBateriaBaixa] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [temPendentes, setTemPendentes] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Monitora o nível da bateria continuamente
    const subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      const nivel = batteryLevel * 100;
      setBatteryLevel(batteryLevel);
      setBateriaBaixa(nivel <= 15);
    });

    // Verifica o nível inicial
    const checkBattery = async () => {
      const level = await Battery.getBatteryLevelAsync();
      setBatteryLevel(level);
      setBateriaBaixa(level * 100 <= 15);
    };
    checkBattery();

    // Monitora o estado da rede
    const networkSubscription = Network.addNetworkStateListener((state) => {
      setOnline(state.isConnected ?? false);
    });

    // Verifica pendências offline
    const checkPendentes = async () => {
      const dados = await SecureStore.getItemAsync('contagensOffline');
      const fila = dados ? JSON.parse(dados) : [];
      setTemPendentes(fila.length > 0);
    };
    checkPendentes();

    return () => {
      subscription.remove();
      networkSubscription.remove();
    };
  }, []);

  // Só exibe o aviso se bateria ≤ 15%, houver pendentes e estiver offline
  if (!bateriaBaixa || !temPendentes || online) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        ⚠️ Bateria baixa ({Math.round(batteryLevel * 100)}%) e você tem contagens offline. 
        Conecte o carregador e sincronize quando possível.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#dc2626',
    padding: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 10,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 13,
  },
});