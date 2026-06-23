import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { cores } from '../styles/GlobalStyles';

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
      const response = await api.get('/ranking-diario/');
      setRanking(response.data.ranking);
      setOperadorLogado(response.data.operador_logado);
      setMetaDiaria(response.data.meta_diaria || 150);
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
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy-outline" size={40} color="#f59e0b" />
        <Text style={styles.titulo}>Ranking do Dia</Text>
        <Text style={styles.subtitulo}>Meta: {metaDiaria} pallets</Text>
      </View>
      <FlatList
        data={ranking}
        keyExtractor={(item) => item.operador__username}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, padding: 20 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 40 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: cores.texto, marginTop: 10 },
  subtitulo: { fontSize: 14, color: cores.textoMutado, marginTop: 5 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.cartao,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  itemDestaque: {
    borderWidth: 2,
    borderColor: cores.primaria,
    backgroundColor: '#eff6ff',
  },
  posicaoContainer: { marginRight: 12 },
  posicao: { fontSize: 18, fontWeight: 'bold', color: cores.textoMutado },
  nome: { fontSize: 16, fontWeight: '600', color: cores.texto },
  palletsContainer: { flexDirection: 'row', alignItems: 'center' },
  pallets: { fontSize: 18, fontWeight: 'bold', color: cores.primaria },
  palletsLabel: { fontSize: 12, color: cores.textoMutado, marginLeft: 4 },
});