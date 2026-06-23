import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import api from '../services/api';

interface Props {
  children: React.ReactNode;
}

function compararVersoes(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const a = parts1[i] || 0;
    const b = parts2[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}

export default function VersionGuard({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [versaoMinima, setVersaoMinima] = useState('');

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  useEffect(() => {
    const verificarVersao = async () => {
      try {
        const response = await api.get('/config/versao-minima/');
        const minima = response.data.versao_minima;
        setVersaoMinima(minima);

        if (compararVersoes(appVersion, minima) < 0) {
          setBloqueado(true);
        }
      } catch (error) {
        console.error('Erro ao verificar versão mínima:', error);
        // Se falhar a verificação, permite o acesso 
      } finally {
        setLoading(false);
      }
    };

    verificarVersao();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 15, color: '#64748b' }}>Verificando atualizações...</Text>
      </View>
    );
  }

  if (bloqueado) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={80} color="#dc2626" />
        <Text style={styles.title}>Aplicativo Desatualizado</Text>
        <Text style={styles.subtitle}>
          A sua versão atual ({appVersion}) não é mais compatível com o servidor.{'\n\n'}
          É necessário atualizar para a versão {versaoMinima} ou superior.
        </Text>
        
        <View style={styles.alertBox}>
          <Ionicons name="information-circle" size={24} color="#0369a1" />
          <Text style={styles.alertText}>
            Por favor, entregue este aparelho ao gestor da operação ou à equipe de TI para realizar a instalação do novo pacote.
          </Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  alertBox: {
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertText: {
    color: '#0369a1',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});