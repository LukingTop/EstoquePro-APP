import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface MenuNavegacaoProps {
  visivel: boolean;
  salvando: boolean;
}

export default function MenuNavegacao({ visivel, salvando }: MenuNavegacaoProps) {
  const router = useRouter();

  if (!visivel) return null;

  return (
    <View style={styles.containerGeral}>
      <TouchableOpacity style={styles.btnSecundario} onPress={() => router.push('/lista')} disabled={salvando}>
        <Ionicons name="list" size={20} color="#2563eb" />
        <Text style={styles.btnTextoSecundario}>VER HISTÓRICO</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnSecundario, { borderColor: '#b91c1c' }]}
        onPress={() => router.push('/missoes')}
        disabled={salvando}
      >
        <Ionicons name="shield-checkmark" size={20} color="#b91c1c" />
        <Text style={[styles.btnTextoSecundario, { color: '#b91c1c' }]}>MISSÕES DE RECONTAGEM</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnSecundario, { borderColor: '#64748b' }]}
        onPress={() => router.push('/stage')}
        disabled={salvando}
      >
        <Ionicons name="cube-outline" size={20} color="#64748b" />
        <Text style={[styles.btnTextoSecundario, { color: '#64748b' }]}>📦 LANÇAMENTO LIVRE (STAGE)</Text>
      </TouchableOpacity>

      
      <TouchableOpacity
        style={[styles.btnSecundario, { borderColor: '#dc2626' }]}
        onPress={() => router.push('/avaria')}
        disabled={salvando}
      >
        <Ionicons name="warning-outline" size={20} color="#dc2626" />
        <Text style={[styles.btnTextoSecundario, { color: '#dc2626' }]}>⚠️ REGISTRAR AVARIA</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnSecundario, { borderColor: '#2563eb' }]}
        onPress={() => router.push('/dashboard')}
        disabled={salvando}
      >
        <Ionicons name="stats-chart-outline" size={20} color="#2563eb" />
        <Text style={[styles.btnTextoSecundario, { color: '#2563eb' }]}>📊 MEU PROGRESSO</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnSecundario, { borderColor: '#f59e0b' }]}
        onPress={() => router.push('/ranking')}
        disabled={salvando}
      >
        <Ionicons name="trophy-outline" size={20} color="#f59e0b" />
        <Text style={[styles.btnTextoSecundario, { color: '#f59e0b' }]}>🏆 RANKING</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  containerGeral: {
    marginTop: 20,
    gap: 12,
  },
  btnSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  btnTextoSecundario: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
});