import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderContagemProps {
  operadorLogado: string;
  handleLogout: () => void;
  tituloSessao?: string; 
}

export default function HeaderContagem({ operadorLogado, handleLogout, tituloSessao }: HeaderContagemProps) {
  return (
    <View style={styles.headerOperador}>
      <Ionicons name="person-circle" size={26} color="#475569" />
      <View style={styles.infoContainer}>
        <Text style={styles.textoOperador}>
          Operador: <Text style={styles.nomeOperador}>@{operadorLogado || '...'}</Text>
        </Text>
        {tituloSessao ? (
          <Text style={styles.sessaoTitulo} numberOfLines={1}>
            🗓️ {tituloSessao}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity style={styles.btnSair} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#dc2626" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerOperador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 8,
  },
  textoOperador: {
    fontSize: 15,
    color: '#64748b',
  },
  nomeOperador: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sessaoTitulo: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 2,
  },
  btnSair: {
    padding: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
});