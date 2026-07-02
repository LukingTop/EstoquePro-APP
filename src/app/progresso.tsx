import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from './../services/api';

const COR_PRIMARIA = '#4c1d95';
const COR_FUNDO = '#F8FAFC';
const COR_CARD = '#FFFFFF';
const COR_BORDA = '#E2E8F0';
const COR_TEXTO_ESCURO = '#0F172A';
const COR_TEXTO_MEDIO = '#64748B';
const COR_VERDE = '#15803D';

export default function ProgressoScreen() {
  const [loading, setLoading] = useState(true);
  const [pallets, setPallets] = useState(0);
  const [missoes, setMissoes] = useState(0);
  const [ultimas, setUltimas] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Dados de produtividade
      const prodResp = await api.get('/operador/produtividade-diaria/', config);
      setPallets(prodResp.data.total_pallets ?? 0);
      setMissoes(prodResp.data.missoes_concluidas ?? 0);

      // Últimas contagens do operador (limitado a 5)
      const contResp = await api.get('/contagens/', {
        ...config,
        params: { ordering: '-data_hora', page_size: 5 },
      });
      setUltimas(contResp.data.results || contResp.data);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centro}>
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
        <Text style={styles.headerTitulo}>Meu Progresso</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.resumoContainer}>
        <View style={styles.cardResumo}>
          <Text style={styles.resumoValor}>{pallets}</Text>
          <Text style={styles.resumoLabel}>Pallets hoje</Text>
        </View>
        <View style={styles.cardResumo}>
          <Text style={styles.resumoValor}>{missoes}</Text>
          <Text style={styles.resumoLabel}>Missões concluídas</Text>
        </View>
      </View>

      <Text style={styles.secaoTitulo}>Últimos Itens Contados</Text>
      <FlatList
        data={ultimas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Ionicons name="checkmark-circle" size={20} color={COR_VERDE} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemEndereco}>{item.endereco_codigo || item.endereco || '---'}</Text>
              <Text style={styles.itemProduto}>{item.codigo_produto} – {item.descricao_produto}</Text>
            </View>
            <Text style={styles.itemPallets}>{item.pallets} pal.</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: COR_TEXTO_MEDIO, marginTop: 20 }}>
            Nenhuma contagem registrada hoje.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COR_FUNDO },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  headerTitulo: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  resumoContainer: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginBottom: 24 },
  cardResumo: {
    flex: 1,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COR_BORDA,
  },
  resumoValor: { fontSize: 24, fontWeight: 'bold', color: COR_PRIMARIA },
  resumoLabel: { fontSize: 12, color: COR_TEXTO_MEDIO, marginTop: 4 },
  secaoTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: COR_TEXTO_MEDIO,
    marginLeft: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COR_CARD,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COR_BORDA,
  },
  itemEndereco: { fontSize: 14, fontWeight: '600', color: COR_TEXTO_ESCURO },
  itemProduto: { fontSize: 12, color: COR_TEXTO_MEDIO, marginTop: 2 },
  itemPallets: { fontSize: 14, fontWeight: '700', color: COR_PRIMARIA },
});