// app/ranking.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const COR_PRIMARIA = '#4c1d95';
const COR_FUNDO = '#F8FAFC';
const COR_CARD = '#FFFFFF';
const COR_BORDA = '#E2E8F0';
const COR_TEXTO_ESCURO = '#0F172A';
const COR_TEXTO_MEDIO = '#64748B';

export default function RankingScreen() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [operadorLogado, setOperadorLogado] = useState('');
  const [metaDiaria, setMetaDiaria] = useState(150);

  useEffect(() => {
    carregarRanking();
  }, []);

  const carregarRanking = async () => {
    try {
      const userLogado = await SecureStore.getItemAsync('loggedUser');
      setOperadorLogado(userLogado || '');

      const response = await api.get('/ranking-diario/');
      let lista = response.data.ranking || [];
      setMetaDiaria(response.data.meta_diaria || 150);

      // Garante que o operador logado apareça, mesmo com 0 pallets
      if (userLogado && !lista.find((item: any) => item.operador__username === userLogado)) {
        lista.push({
          operador__username: userLogado,
          total_pallets: 0,
        });
      }
      setRanking(lista);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isOperadorLogado = item.operador__username === operadorLogado;
    const bateuMeta = item.total_pallets >= metaDiaria;

    return (
      <View style={[styles.item, isOperadorLogado && styles.itemDestaque]}>
        <View style={styles.posicaoContainer}>
          <Text style={styles.posicao}>{index + 1}º</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>
            {item.operador__username}
            {isOperadorLogado ? ' (você)' : ''}
          </Text>
        </View>
        <View style={styles.palletsContainer}>
          <Text style={styles.pallets}>{item.total_pallets}</Text>
          <Text style={styles.palletsLabel}>pallets</Text>
          {bateuMeta && (
            <Ionicons name="star" size={20} color="#f59e0b" style={{ marginLeft: 8 }} />
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COR_PRIMARIA} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ranking do Dia</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.metaContainer}>
        <Ionicons name="trophy-outline" size={40} color="#f59e0b" />
        <Text style={styles.metaTexto}>Meta: {metaDiaria} pallets</Text>
      </View>

      <FlatList
        data={ranking}
        keyExtractor={(item) => item.operador__username}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COR_FUNDO },
  header: {
    backgroundColor: COR_PRIMARIA,
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  metaContainer: { alignItems: 'center', marginBottom: 20 },
  metaTexto: { fontSize: 14, color: COR_TEXTO_MEDIO, marginTop: 5 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COR_BORDA,
  },
  itemDestaque: {
    borderWidth: 2,
    borderColor: COR_PRIMARIA,
    backgroundColor: '#EDE9FE',
  },
  posicaoContainer: { marginRight: 12 },
  posicao: { fontSize: 18, fontWeight: 'bold', color: COR_TEXTO_MEDIO },
  nome: { fontSize: 16, fontWeight: '600', color: COR_TEXTO_ESCURO },
  palletsContainer: { flexDirection: 'row', alignItems: 'center' },
  pallets: { fontSize: 18, fontWeight: 'bold', color: COR_PRIMARIA },
  palletsLabel: { fontSize: 12, color: COR_TEXTO_MEDIO, marginLeft: 4 },
});