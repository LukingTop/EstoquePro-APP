import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProgressoProps {
  isRecontagem: boolean;
  rotaAtiva: boolean;
  ruaSelecionada: string;
  currentIndex: number;
  totalEnderecos: number;
  progressoPct: number;
  onCancelarRota: () => void;
}

export default function HeaderProgresso({
  isRecontagem,
  rotaAtiva,
  ruaSelecionada,
  currentIndex,
  totalEnderecos,
  progressoPct,
  onCancelarRota,
}: HeaderProgressoProps) {
  return (
    <>
      <View style={styles.progressoHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.progressoRua}>
            {isRecontagem
              ? 'Resolução de Conflito'
              : rotaAtiva
              ? `Rua ${ruaSelecionada}`
              : ruaSelecionada
              ? 'Repetir Contagem'
              : 'Selecionar Rua'}
          </Text>
          {rotaAtiva && !isRecontagem && (
            <Text style={styles.progressoTexto}>
              Passo {currentIndex + 1} de {totalEnderecos}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={onCancelarRota} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle-outline" size={28} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {rotaAtiva && !isRecontagem && (
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressoPct}%` }]} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  progressoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressoRua: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  progressoTexto: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4c1d95',
    borderRadius: 3,
  },
});