import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CardEnderecoAtualProps {
  isRecontagem: boolean;
  enderecoAtual: string | null;
  enderecoAtualObj: any;
}

export default function CardEnderecoAtual({ isRecontagem, enderecoAtual, enderecoAtualObj }: CardEnderecoAtualProps) {
  return (
    <View style={styles.inputGrupo}>
      <Text style={styles.label}>
        <Ionicons name="location-outline" size={16} /> Endereço Atual
      </Text>
      
      <View style={[styles.enderecoTravado, isRecontagem && { borderColor: '#b91c1c', backgroundColor: '#fef2f2' }]}>
        <Ionicons name="lock-closed" size={18} color={isRecontagem ? '#b91c1c' : '#2563eb'} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.enderecoTravadoTexto, isRecontagem && { color: '#7f1d1d' }]}>
            {enderecoAtual || 'Nenhum endereço selecionado'}
          </Text>
          {enderecoAtualObj && (enderecoAtualObj.predio || enderecoAtualObj.posicao) && (
            <Text style={styles.enderecoTravadoSub}>
              Prédio {enderecoAtualObj.predio ?? '—'} · Posição {enderecoAtualObj.posicao ?? '—'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGrupo: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  enderecoTravado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 14,
  },
  enderecoTravadoTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  enderecoTravadoSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
});