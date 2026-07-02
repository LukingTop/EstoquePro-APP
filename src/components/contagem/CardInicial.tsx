import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CardInicialProps {
  onIniciarRota: () => void;
}

export default function CardInicial({ onIniciarRota }: CardInicialProps) {
  return (
    <View style={styles.cardInicial}>
      <View style={styles.iconeInicialWrapper}>
        <Ionicons name="navigate-circle-outline" size={56} color="#2563eb" />
      </View>
      <Text style={styles.tituloInicial}>Contagem Sequencial</Text>
      <Text style={styles.subtituloInicial}>
       Escolha uma sessão de contagem iniciada pelo administrador.
      </Text>

      <TouchableOpacity style={styles.btnIniciarRota} onPress={onIniciarRota}>
        <Ionicons name="play-circle" size={22} color="#fff" />
        <Text style={styles.btnTexto}>INICIAR CONTAGEM</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardInicial: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  iconeInicialWrapper: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  tituloInicial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtituloInicial: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  btnIniciarRota: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    gap: 8,
  },
  btnTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});