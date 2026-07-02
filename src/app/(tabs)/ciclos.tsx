import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
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

interface Sessao {
  id: number;
  titulo: string;
  tipo: string;
  ruas_codigos: string[];
  ativo: boolean;
  status?: string; // opcional, para filtro futuro
}

export default function CiclosScreen() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'TODOS' | 'EM_ANDAMENTO' | 'CONCLUIDO'>('TODOS');

  const carregarSessoes = useCallback(async () => {
    try {
      const response = await api.get('/sessoes/');
      const dados = response.data.results || response.data;
      // Filtra apenas sessões ativas
      const ativas = Array.isArray(dados) ? dados.filter((s: any) => s.ativo) : [];
      setSessoes(ativas);
    } catch (error: any) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarSessoes();
  }, [carregarSessoes]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarSessoes();
  };

const sessoesFiltradas = sessoes.filter((s) => {
  const passaBusca =
    s.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    s.tipo?.toLowerCase().includes(busca.toLowerCase());

  if (filtroAtivo === 'EM_ANDAMENTO') {
    return passaBusca && s.ativo === true;
  }
  if (filtroAtivo === 'CONCLUIDO') {
    return passaBusca && s.ativo === false;
  }
  return passaBusca;
});

  
  const handleSelecionarSessao = (sessao: Sessao) => {
    router.push({
      pathname: '/contagem/[id]' as any,
      params: {
        id: String(sessao.id),
        sessao_id: sessao.id,
        sessao_titulo: sessao.titulo,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header simples durante carregamento */}
        <View style={styles.header}>
          <View style={styles.headerBtn} />
          <Text style={styles.headerTitulo}>Ciclos de Contagem</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={COR_PRIMARIA} />
          <Text style={styles.carregandoTexto}>Carregando sessões...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header roxo */}
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <Text style={styles.headerTitulo}>Ciclos de Contagem</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Barra de busca */}
      <View style={styles.buscaContainer}>
        <View style={styles.barraBusca}>
          <Ionicons name="search-outline" size={20} color={COR_TEXTO_MEDIO} />
          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar por título ou tipo..."
            placeholderTextColor={COR_TEXTO_MEDIO}
            value={busca}
            onChangeText={setBusca}
          />
          {busca !== '' && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={18} color={COR_TEXTO_MEDIO} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros em pílulas */}
      <View style={styles.filtrosContainer}>
        {(['TODOS', 'EM_ANDAMENTO', 'CONCLUIDO'] as const).map((filtro) => (
          <TouchableOpacity
            key={filtro}
            style={[styles.pilula, filtroAtivo === filtro && styles.pilulaAtiva]}
            onPress={() => setFiltroAtivo(filtro)}
          >
            <Text style={[styles.pilulaTexto, filtroAtivo === filtro && styles.pilulaTextoAtivo]}>
              {filtro === 'TODOS' ? 'Todos' : filtro === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Concluídos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de sessões */}
      <FlatList
        data={sessoesFiltradas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listaContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COR_PRIMARIA]} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelecionarSessao(item)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="folder-open-outline" size={24} color={COR_PRIMARIA} />
              <Text style={styles.cardTitulo} numberOfLines={1}>
                {item.titulo}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COR_TEXTO_MEDIO} />
            </View>
            <Text style={styles.cardRuas}>
              Ruas: {item.ruas_codigos?.join(', ') || 'Todas disponíveis'}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardTipo}>
                {item.tipo || '1ª Contagem'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.centro}>
            <Ionicons name="folder-open-outline" size={48} color={COR_BORDA} />
            <Text style={styles.vazioTexto}>Nenhuma sessão encontrada.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  centro: {
    flex: 1,
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
  buscaContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
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
  },
  inputBusca: {
    flex: 1,
    fontSize: 14,
    color: COR_TEXTO_ESCURO,
  },
  filtrosContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pilula: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COR_CARD,
    borderWidth: 1,
    borderColor: COR_BORDA,
  },
  pilulaAtiva: {
    backgroundColor: COR_PRIMARIA,
    borderColor: COR_PRIMARIA,
  },
  pilulaTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COR_TEXTO_MEDIO,
  },
  pilulaTextoAtivo: {
    color: '#FFFFFF',
  },
  listaContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COR_BORDA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COR_TEXTO_ESCURO,
    marginLeft: 12,
    flex: 1,
  },
  cardRuas: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
    marginLeft: 36,
  },
  cardFooter: {
    marginTop: 4,
    marginLeft: 36,
  },
  cardTipo: {
    fontSize: 13,
    color: COR_TEXTO_MEDIO,
    fontWeight: '600',
  },
  vazioTexto: {
    marginTop: 12,
    color: COR_TEXTO_MEDIO,
    fontSize: 16,
    textAlign: 'center',
  },
});