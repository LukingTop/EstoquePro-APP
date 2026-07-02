import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../services/api';

// ── Design  ─────────────────────────────
const COR_PRIMARIA = '#4c1d95';
const COR_FUNDO = '#F8FAFC';
const COR_CARD = '#FFFFFF';
const COR_BORDA = '#E2E8F0';
const COR_TEXTO_ESCURO = '#0F172A';
const COR_TEXTO_MEDIO = '#64748B';
const COR_VERDE = '#15803D';
const COR_LARANJA = '#C2410C';
const COR_VERMELHO = '#B91C1C';

interface ItemCiclo {
  id: number;
  endereco: string;
  local?: string;
  sku: string;
  produto: string;
  pallets: number;
  unidades?: number;
  status: 'concluido' | 'em_andamento' | 'pendente' | 'divergente';
  observacao?: string;
  operador?: string;
}

export default function DetalhesCicloScreen() {
  const { sessao_id, sessao_titulo } = useLocalSearchParams<{
    sessao_id: string;
    sessao_titulo?: string;
  }>();

  const [itens, setItens] = useState<ItemCiclo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'itens' | 'resumo' | 'progresso'>('itens');
  const [busca, setBusca] = useState('');
  const [cicloInfo, setCicloInfo] = useState<any>(null);

  const carregarDados = useCallback(async () => {
    if (!sessao_id) return;
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        router.replace('/login');
        return;
      }
      // Buscar informações do ciclo
      try {
        const cicloResponse = await api.get(`/sessoes/${sessao_id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCicloInfo(cicloResponse.data);
      } catch (e) {
        console.log('Detalhes do ciclo não disponíveis, usando dados básicos');
        setCicloInfo({
          id: sessao_id,
          titulo: sessao_titulo || `Ciclo #${sessao_id}`,
          tipo: 'Inventário Geral',
          status: 'Em Andamento',
          data: new Date().toLocaleDateString('pt-BR'),
          criado_por_username: 'Sistema',
        });
      }

      // Buscar itens do ciclo (contagens vinculadas à sessão)
      const response = await api.get('/contagens/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { sessao: sessao_id, page_size: 100 },
      });
      const dados = response.data.results || response.data;
      const itensFormatados: ItemCiclo[] = dados.map((item: any) => ({
        id: item.id,
        endereco: item.endereco || item.rua || '--',
        local: item.endereco || item.rua || 'Não informado',
        sku: item.codigo_produto || '--',
        produto: item.descricao_produto || 'Produto não descrito',
        pallets: item.pallets || 0,
        unidades: item.unidades,
        status: item.status || (item.pallets > 0 ? 'concluido' : 'pendente'),
        observacao: item.observacao,
        operador: item.operador,
      }));
      setItens(itensFormatados);
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Sessão Expirada', 'Faça login novamente.');
        router.replace('/login');
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os itens do ciclo.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessao_id, sessao_titulo]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const itensFiltrados = itens.filter((item) =>
    item.local?.toLowerCase().includes(busca.toLowerCase()) ||
    item.sku?.toLowerCase().includes(busca.toLowerCase()) ||
    item.produto?.toLowerCase().includes(busca.toLowerCase())
  );

  const getBadgeStyle = (status: ItemCiclo['status']) => {
    switch (status) {
      case 'concluido':
        return { bg: '#dcfce7', text: COR_VERDE, label: 'Concluído' };
      case 'em_andamento':
        return { bg: '#ffedd5', text: COR_LARANJA, label: 'Em Contagem' };
      case 'pendente':
        return { bg: '#fef3c7', text: '#b45309', label: 'Pendente' };
      case 'divergente':
        return { bg: '#fee2e2', text: COR_VERMELHO, label: 'Divergente' };
      default:
        return { bg: '#f1f5f9', text: COR_TEXTO_MEDIO, label: status };
    }
  };

  const handleItemPress = (item: ItemCiclo) => {
    if (item.status === 'concluido') {
      router.push({
        pathname: '/contagem/historico',
        params: {
          itemId: String(item.id),
          local: item.local,
          sku: item.sku,
          produto: item.produto,
          estoqueWms: `${item.pallets} Pal / ${item.unidades || 0} Un`,
        },
      });
    } else {
      router.push({
        pathname: '/contagem/[id]' as any,
        params: {
          id: String(item.id),
          endereco_trava: item.endereco,
          produto_trava: item.sku,
          descricao_trava: item.produto,
        },
      });
    }
  };

  // Dados para os resumos e progresso
  const totalItens = itens.length;
  const concluidos = itens.filter((i) => i.status === 'concluido').length;
  const emContagem = itens.filter((i) => i.status === 'em_andamento').length;
  const pendentes = totalItens - concluidos - emContagem;
  const percentual = totalItens > 0 ? Math.round((concluidos / totalItens) * 100) : 0;

  // Últimos 5 itens contados 
  const ultimosItens = [...itens]
    .filter((i) => i.status === 'concluido')
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={COR_PRIMARIA} />
        <Text style={{ marginTop: 12, color: COR_TEXTO_MEDIO }}>Carregando detalhes do ciclo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header roxo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Ciclo</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Card de informações do ciclo */}
      {cicloInfo && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CICLO ATUAL</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.infoLabel}>ID do Ciclo</Text>
            <Text style={styles.infoValue}>{cicloInfo.id}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={[styles.badge, { backgroundColor: '#ffedd5' }]}>
              <Text style={[styles.badgeText, { color: COR_LARANJA }]}>
                {cicloInfo.status || 'Em Andamento'}
              </Text>
            </View>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.infoLabel}>Tipo</Text>
            <Text style={styles.infoValue}>{cicloInfo.tipo || 'Inventário Geral'}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.infoLabel}>Data</Text>
            <Text style={styles.infoValue}>{cicloInfo.data || '--'}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.infoLabel}>Criado por</Text>
            <Text style={styles.infoValue}>
              {cicloInfo.criado_por_username || cicloInfo.criado_por || 'Sistema'}
            </Text>
          </View>
        </View>
      )}

      {/* Abas internas */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'itens' && styles.tabActive]}
          onPress={() => setActiveTab('itens')}
        >
          <Text style={[styles.tabText, activeTab === 'itens' && styles.tabTextActive]}>
            Itens do Ciclo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progresso' && styles.tabActive]}
          onPress={() => setActiveTab('progresso')}
        >
          <Text style={[styles.tabText, activeTab === 'progresso' && styles.tabTextActive]}>
            Progresso
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'resumo' && styles.tabActive]}
          onPress={() => setActiveTab('resumo')}
        >
          <Text style={[styles.tabText, activeTab === 'resumo' && styles.tabTextActive]}>
            Resumo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo das abas */}
      {activeTab === 'itens' ? (
        <>
          {/* Barra de busca */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COR_TEXTO_MEDIO} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por local, SKU ou produto..."
              placeholderTextColor="#94a3b8"
              value={busca}
              onChangeText={setBusca}
            />
          </View>

          <FlatList
            data={itensFiltrados}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listaContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COR_PRIMARIA]} />
            }
            renderItem={({ item }) => {
              const badge = getBadgeStyle(item.status);
              return (
                <TouchableOpacity
                  style={styles.itemCard}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemLocal}>{item.local}</Text>
                    <Text style={styles.itemSku}>{item.sku} - {item.produto}</Text>
                  </View>
                  <View style={styles.itemRight}>
                    <View style={[styles.itemBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.itemBadgeText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COR_TEXTO_MEDIO} />
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centro}>
                <Ionicons name="cube-outline" size={48} color={COR_BORDA} />
                <Text style={{ marginTop: 12, color: COR_TEXTO_MEDIO }}>Nenhum item encontrado.</Text>
              </View>
            }
          />
        </>
      ) : activeTab === 'progresso' ? (
        // Aba Progresso
        <View style={styles.resumoCard}>
          <Text style={styles.resumoTitle}>PROGRESSO DO CICLO</Text>
          <View style={styles.resumoContent}>
            <View style={styles.donutContainer}>
              <View style={styles.donut}>
                <Text style={styles.donutPercent}>{percentual}%</Text>
              </View>
            </View>
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#1e293b' }]} />
                <Text style={styles.legendText}>Total de Itens: {totalItens}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: COR_VERDE }]} />
                <Text style={styles.legendText}>Concluídos: {concluidos}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: COR_LARANJA }]} />
                <Text style={styles.legendText}>Em Contagem: {emContagem}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.legendText}>Pendentes: {pendentes}</Text>
              </View>
            </View>
          </View>

          {/* Últimos itens contados */}
          {ultimosItens.length > 0 && (
            <>
              <Text style={styles.ultimosTitulo}>ÚLTIMOS ITENS CONTADOS</Text>
              {ultimosItens.map((item, index) => (
                <View key={index} style={styles.ultimoItemRow}>
                  <Ionicons name="checkmark-circle" size={20} color={COR_VERDE} />
                  <View style={styles.ultimoItemInfo}>
                    <Text style={styles.ultimoItemLocal} numberOfLines={1}>{item.local}</Text>
                    <Text style={styles.ultimoItemProduto} numberOfLines={1}>{item.produto}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      ) : (
        // Aba Resumo 
        <View style={styles.resumoCard}>
          <Text style={styles.resumoTitle}>RESUMO DO CICLO</Text>
          <View style={styles.resumoContent}>
            <View style={styles.donutContainer}>
              <View style={styles.donut}>
                <Text style={styles.donutPercent}>{percentual}%</Text>
              </View>
            </View>
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#1e293b' }]} />
                <Text style={styles.legendText}>Total de Itens: {totalItens}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: COR_VERDE }]} />
                <Text style={styles.legendText}>Concluídos: {concluidos}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: COR_LARANJA }]} />
                <Text style={styles.legendText}>Em Contagem: {emContagem}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.legendText}>Pendentes: {pendentes}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COR_FUNDO },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: COR_PRIMARIA,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerBtn: { width: 44, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  card: {
    backgroundColor: COR_CARD,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COR_BORDA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COR_PRIMARIA,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: { fontSize: 14, color: COR_TEXTO_MEDIO },
  infoValue: { fontSize: 14, fontWeight: '500', color: COR_TEXTO_ESCURO },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COR_CARD,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COR_BORDA,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COR_PRIMARIA },
  tabText: { fontSize: 14, fontWeight: '500', color: COR_TEXTO_MEDIO },
  tabTextActive: { color: '#FFFFFF', fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COR_CARD,
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COR_BORDA,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: COR_TEXTO_ESCURO },
  listaContent: { paddingHorizontal: 16, paddingBottom: 24 },
  itemCard: {
    backgroundColor: COR_CARD,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COR_BORDA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemLocal: { fontSize: 14, fontWeight: '600', color: COR_TEXTO_ESCURO, marginBottom: 2 },
  itemSku: { fontSize: 13, color: COR_TEXTO_MEDIO },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  itemBadgeText: { fontSize: 12, fontWeight: '600' },
  // Resumo / Progresso
  resumoCard: {
    backgroundColor: COR_CARD,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COR_BORDA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  resumoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COR_PRIMARIA,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resumoContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  donutContainer: { alignItems: 'center' },
  donut: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 12,
    borderColor: COR_PRIMARIA,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COR_FUNDO,
  },
  donutPercent: { fontSize: 20, fontWeight: '700', color: COR_TEXTO_ESCURO },
  legendContainer: { marginLeft: 16 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 14, color: '#334155' },
  // Últimos itens
  ultimosTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: COR_TEXTO_MEDIO,
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ultimoItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COR_BORDA,
  },
  ultimoItemInfo: { flex: 1 },
  ultimoItemLocal: { fontSize: 14, fontWeight: '600', color: COR_TEXTO_ESCURO },
  ultimoItemProduto: { fontSize: 12, color: COR_TEXTO_MEDIO, marginTop: 2 },
});