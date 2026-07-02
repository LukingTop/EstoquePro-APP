// app/(tabs)/inicio.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../services/api';

// ── Design ─────────────────────────────
const COR_PRIMARIA = '#4c1d95';
const COR_FUNDO = '#F8FAFC';
const COR_CARD = '#FFFFFF';
const COR_BORDA = '#E2E8F0';
const COR_TEXTO_ESCURO = '#0F172A';
const COR_TEXTO_MEDIO = '#64748B';
const COR_VERDE = '#15803D';
const COR_LARANJA = '#C2410C';
const COR_VERMELHO = '#B91C1C';

interface TarefaRecontagem {
  id: number;
  endereco_str: string;
  produto_str: string;
  descricao_str: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | string;
}

export default function InicioScreen() {
  const [tarefas, setTarefas] = useState<TarefaRecontagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState('');
  const [nomeOperador, setNomeOperador] = useState('');

  useEffect(() => {
    SecureStore.getItemAsync('loggedUser').then(user => {
      if (user) setNomeOperador(user);
    });
  }, []);

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  const carregarTarefas = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await api.get('/tarefas-recontagem/');
      const dados = response.data.results || response.data;
      setTarefas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarTarefas();
    }, [carregarTarefas])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarTarefas(true);
  };

  const assumirMissao = async (tarefa: TarefaRecontagem) => {
    try {
      if (tarefa.status === 'PENDENTE') {
        await api.post(`/tarefas-recontagem/${tarefa.id}/assumir/`);
      }
      router.push({
        pathname: '/contagem/[id]' as any,
        params: {
          id: String(tarefa.id),
          tarefa_id: tarefa.id,
          endereco_trava: tarefa.endereco_str,
          produto_trava: tarefa.produto_str,
          descricao_trava: tarefa.descricao_str,
          is_recontagem: 'true',
        },
      });
    } catch (error) {
      console.error('Erro ao assumir missão:', error);
      Alert.alert('Erro', 'Não foi possível assumir esta missão no momento.');
    }
  };

  const tarefasFiltradas = tarefas.filter((t) =>
    t.endereco_str.toLowerCase().includes(busca.toLowerCase()) ||
    t.produto_str.toLowerCase().includes(busca.toLowerCase()) ||
    t.descricao_str.toLowerCase().includes(busca.toLowerCase())
  );

  const resumo = {
    pendentes: tarefas.length,
    emContagem: 0,
    concluidos: 0,
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centro]}>
        <ActivityIndicator size="large" color={COR_PRIMARIA} />
        <Text style={styles.carregandoTexto}>Buscando missões...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header roxo simplificado */}
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <Text style={styles.headerTitulo}>Início</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COR_PRIMARIA]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Boas‑vindas */}
        <View style={styles.boasVindas}>
          <Text style={styles.saudacao}>
            Olá, <Text style={styles.nomeOperador}>{nomeOperador}</Text>
          </Text>
          <Text style={styles.data}>{dataFormatada}</Text>
        </View>

        {/* Cards de Resumo */}
        <View style={styles.resumoRow}>
          <View style={styles.cardResumo}>
            <View style={[styles.iconeResumo, { backgroundColor: COR_LARANJA + '18' }]}>
              <Ionicons name="alert-circle-outline" size={22} color={COR_LARANJA} />
            </View>
            <Text style={styles.valorResumo}>{resumo.pendentes}</Text>
            <Text style={styles.labelResumo}>Pendentes</Text>
          </View>
          <View style={styles.cardResumo}>
            <View style={[styles.iconeResumo, { backgroundColor: COR_LARANJA + '18' }]}>
              <Ionicons name="timer-outline" size={22} color={COR_LARANJA} />
            </View>
            <Text style={styles.valorResumo}>{resumo.emContagem}</Text>
            <Text style={styles.labelResumo}>Em Contagem</Text>
          </View>
          <View style={styles.cardResumo}>
            <View style={[styles.iconeResumo, { backgroundColor: COR_VERDE + '18' }]}>
              <Ionicons name="checkmark-circle-outline" size={22} color={COR_VERDE} />
            </View>
            <Text style={styles.valorResumo}>{resumo.concluidos}</Text>
            <Text style={styles.labelResumo}>Concluídos</Text>
          </View>
        </View>

        {/* Seção Missões de Recontagem */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>MISSÕES DE RECONTAGEM</Text>
          <View style={styles.barraBusca}>
            <Ionicons name="search-outline" size={20} color={COR_TEXTO_MEDIO} />
            <TextInput
              style={styles.inputBusca}
              placeholder="Buscar por endereço, produto ou descrição..."
              placeholderTextColor={COR_TEXTO_MEDIO}
              value={busca}
              onChangeText={setBusca}
            />
          </View>

          <FlatList
            data={tarefasFiltradas}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.cardMissao}>
                <View style={styles.missaoHeader}>
                  <Ionicons name="location-outline" size={16} color={COR_PRIMARIA} />
                  <Text style={styles.missaoEndereco} numberOfLines={1}>
                    {item.endereco_str}
                  </Text>
                  <View style={[
                    styles.badgeStatus,
                    item.status === 'PENDENTE' ? styles.badgePendente : styles.badgeAndamento
                  ]}>
                    <Text style={styles.badgeTexto}>
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.missaoProduto} numberOfLines={2}>
                  {item.produto_str} - {item.descricao_str}
                </Text>
                <TouchableOpacity
                  style={styles.botaoIniciar}
                  onPress={() => assumirMissao(item)}
                >
                  <Text style={styles.botaoIniciarTexto}>INICIAR MISSÃO</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.vazio}>
                <Ionicons name="shield-checkmark-outline" size={48} color={COR_BORDA} />
                <Text style={styles.vazioTexto}>Nenhuma missão pendente no momento.</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  centro: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  carregandoTexto: {
    marginTop: 12,
    fontSize: 16,
    color: COR_TEXTO_MEDIO,
  },
  header: {
    backgroundColor: COR_PRIMARIA,
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: {
    width: 40,
    alignItems: 'center',
  },
  headerTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  boasVindas: {
    marginBottom: 24,
  },
  saudacao: {
    fontSize: 26,
    color: COR_TEXTO_ESCURO,
    fontWeight: '600',
  },
  nomeOperador: {
    fontWeight: 'bold',
    color: COR_PRIMARIA,
  },
  data: {
    fontSize: 14,
    color: COR_TEXTO_MEDIO,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  resumoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  cardResumo: {
    flex: 1,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COR_BORDA,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconeResumo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  valorResumo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COR_TEXTO_ESCURO,
  },
  labelResumo: {
    fontSize: 12,
    color: COR_TEXTO_MEDIO,
    marginTop: 2,
  },
  secao: {
    marginBottom: 28,
  },
  tituloSecao: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COR_TEXTO_MEDIO,
    letterSpacing: 0.8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  barraBusca: {
    backgroundColor: COR_CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COR_BORDA,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  inputBusca: {
    flex: 1,
    fontSize: 14,
    color: COR_TEXTO_ESCURO,
  },
  cardMissao: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COR_BORDA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  missaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  missaoEndereco: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COR_TEXTO_ESCURO,
  },
  badgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePendente: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderWidth: 1,
  },
  badgeAndamento: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
    borderWidth: 1,
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COR_LARANJA,
  },
  missaoProduto: {
    fontSize: 15,
    color: COR_TEXTO_ESCURO,
    marginBottom: 14,
  },
  botaoIniciar: {
    backgroundColor: COR_PRIMARIA,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoIniciarTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  vazioTexto: {
    fontSize: 16,
    color: COR_TEXTO_MEDIO,
    marginTop: 12,
    textAlign: 'center',
  },
});