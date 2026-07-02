import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatusBannersProps {
  isRecontagem: boolean;
  preenchidoDoHistorico: boolean;
  foiContadoRecentemente: boolean;
}

export default function StatusBanners({
  isRecontagem,
  preenchidoDoHistorico,
  foiContadoRecentemente,
}: StatusBannersProps) {
  return (
    <>
      {isRecontagem && (
        <View style={styles.bannerMissao}>
          <Ionicons name="shield-checkmark" size={24} color="#b91c1c" />
          <Text style={styles.bannerMissaoTexto}>
            MISSÃO DE RECONTAGEM ATIVA{'\n'}Endereço e Produto bloqueados.
          </Text>
        </View>
      )}

      {preenchidoDoHistorico && !isRecontagem && (
        <View style={styles.bannerHistorico}>
          <Ionicons name="time-outline" size={22} color="#1e40af" />
          <Text style={styles.bannerHistoricoTexto}>
            Produto pré-preenchido do histórico.{'\n'}Informe apenas a quantidade de pallets!
          </Text>
        </View>
      )}

      {foiContadoRecentemente && !isRecontagem && (
        <View style={styles.bannerRecente}>
          <Ionicons name="warning-outline" size={22} color="#d97706" />
          <Text style={styles.bannerRecenteTexto}>
            Este endereço já foi contado nas últimas 2 horas.
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bannerMissao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#b91c1c',
    gap: 10,
    elevation: 2,
  },
  bannerMissaoTexto: {
    color: '#991b1b',
    fontWeight: '600',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bannerHistorico: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#4c1d95',
    gap: 10,
    elevation: 2,
  },
  bannerHistoricoTexto: {
    color: '#4c1d95',
    fontWeight: '600',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bannerRecente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#C2410C',
    gap: 10,
    elevation: 2,
  },
  bannerRecenteTexto: {
    color: '#9a3412',
    fontWeight: '600',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});