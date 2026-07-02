// app/contagem/historico.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../services/api';

// ── Design System Cargo Polo ─────────────────────────────
const COR_PRIMARIA = '#4c1d95';
const COR_FUNDO = '#F8FAFC';
const COR_CARD = '#FFFFFF';
const COR_BORDA = '#E2E8F0';
const COR_TEXTO_ESCURO = '#0F172A';
const COR_TEXTO_MEDIO = '#64748B';
const COR_VERDE = '#15803D';
const COR_VERMELHO = '#B91C1C';

interface HistoricoEntry {
  id: number;
  sequencia: number;
  tipo: 'Contagem' | 'Recontagem' | 'Auditoria';
  dataHora: string;
  qtdPal: number;
  qtdUn: number;
  usuario: string;
  resultado: 'Conforme' | 'Divergente';
  observacao?: string;
}

export default function HistoricoScreen() {
  const params = useLocalSearchParams<{
    itemId: string;
    local: string;
    sku: string;
    produto: string;
    estoqueWms: string; // "120 Pal / 2.880 Un"
  }>();

  const [historico, setHistorico] = useState<HistoricoEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Informações do item recebidas como parâmetro
  const itemInfo = {
    local: params.local || '--',
    sku: params.sku || '--',
    produto: params.produto || 'Produto não informado',
    estoqueWms: params.estoqueWms || '0 Pal / 0 Un',
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      // Buscar contagens para este endereço e SKU (filtro aproximado)
      const response = await api.get('/contagens/', {
        params: {
          endereco: params.local,
          codigo_produto: params.sku,
          ordering: '-data_hora', // mais recente primeiro
          page_size: 50,
        },
      });
      const dados = response.data.results || response.data;
      // Mapear para o formato do histórico
      const entradas: HistoricoEntry[] = dados.map((item: any, index: number) => {
        // Determinar se é contagem, recontagem ou auditoria (se houver campo)
        let tipo: HistoricoEntry['tipo'] = 'Contagem';
        if (item.e_recontagem) {
          tipo = 'Recontagem';
        } else if (item.tipo === 'AUDITORIA') {
          tipo = 'Auditoria';
        }

        // Resultado: se a API fornecer campo 'resultado' ou 'status', use‑o
        let resultado: HistoricoEntry['resultado'] = 'Conforme';
        if (item.resultado === 'DIVERGENTE' || item.status === 'DIVERGENTE') {
          resultado = 'Divergente';
        } else if (item.is_divergente) {
          resultado = 'Divergente';
        }

        return {
          id: item.id,
          sequencia: dados.length - index, // 1 = mais antigo, último = mais recente
          tipo,
          dataHora: item.data_hora || item.criado_em || new Date().toISOString(),
          qtdPal: item.pallets || 0,
          qtdUn: item.unidades || 0,
          usuario: item.operador || 'Sistema',
          resultado,
          observacao: item.observacao || '',
        };
      });
      // Ordenar por sequência crescente (mais antigo primeiro)
      entradas.sort((a, b) => a.sequencia - b.sequencia);
      setHistorico(entradas);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const ultimaObs =
    historico.length > 0 ? historico[historico.length - 1].observacao : 'Nenhuma observação registrada.';

  const getResultadoBadge = (resultado: string) => {
    if (resultado === 'Conforme') {
      return { bg: '#dcfce7', text: COR_VERDE };
    }
    return { bg: '#fee2e2', text: COR_VERMELHO };
  };

  const handleNovaRecontagem = () => {
    router.push({
      pathname: '/contagem/[id]' as any,
      params: {
        id: params.itemId || '0',
        is_recontagem: 'true',
        endereco_trava: params.local,
        produto_trava: params.sku,
        descricao_trava: params.produto,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={COR_PRIMARIA} />
        <Text style={{ marginTop: 12, color: COR_TEXTO_MEDIO }}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header roxo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Contagens</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card de informações do item */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INFORMAÇÕES DO ITEM</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Local</Text>
            <Text style={styles.infoValue}>{itemInfo.local}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SKU</Text>
            <Text style={styles.infoValueSku}>{itemInfo.sku}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Produto</Text>
            <Text style={styles.infoValue}>{itemInfo.produto}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estoque WMS</Text>
            <Text style={styles.infoValue}>{itemInfo.estoqueWms}</Text>
          </View>
        </View>

        {/* Seção histórico */}
        <Text style={styles.sectionTitle}>REGISTROS DE CONTAGEM</Text>
        {historico.map((entry, index) => {
          const badgeStyle = getResultadoBadge(entry.resultado);
          return (
            <View key={index} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.sequenciaBadge}>
                  <Text style={styles.sequenciaText}>{entry.sequencia}ª</Text>
                </View>
                <View style={styles.tipoBadge}>
                  <Text style={styles.tipoText}>{entry.tipo}</Text>
                </View>
                <View style={[styles.resultadoBadge, { backgroundColor: badgeStyle.bg }]}>
                  <Text style={[styles.resultadoText, { color: badgeStyle.text }]}>
                    {entry.resultado}
                  </Text>
                </View>
              </View>
              <View style={styles.historyDetails}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Data/Hora</Text>
                  <Text style={styles.detailValue}>
                    {new Date(entry.dataHora).toLocaleString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Qtd Pal</Text>
                  <Text style={styles.detailValue}>{entry.qtdPal}</Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Qtd Un</Text>
                  <Text style={styles.detailValue}>{entry.qtdUn}</Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Usuário</Text>
                  <Text style={styles.detailValue}>{entry.usuario}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Observação da última contagem */}
        <View style={styles.obsCard}>
          <Text style={styles.obsTitle}>Observação da última contagem</Text>
          <Text style={styles.obsText}>{ultimaObs}</Text>
        </View>

        {/* Botão NOVA RECONTAGEM */}
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleNovaRecontagem}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>NOVA RECONTAGEM</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: { fontSize: 14, color: COR_TEXTO_MEDIO, fontWeight: '500' },
  infoValue: { fontSize: 14, color: COR_TEXTO_ESCURO, fontWeight: '500' },
  infoValueSku: { fontSize: 14, color: COR_PRIMARIA, fontWeight: '600' },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COR_TEXTO_ESCURO,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyCard: {
    backgroundColor: COR_CARD,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COR_BORDA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sequenciaBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sequenciaText: { fontSize: 13, fontWeight: '600', color: COR_TEXTO_ESCURO },
  tipoBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tipoText: { fontSize: 12, fontWeight: '500', color: COR_PRIMARIA },
  resultadoBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultadoText: { fontSize: 12, fontWeight: '600' },
  historyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailColumn: { width: '48%', marginBottom: 8 },
  detailLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: { fontSize: 13, color: COR_TEXTO_ESCURO, fontWeight: '500' },
  obsCard: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COR_BORDA,
    borderLeftWidth: 4,
    borderLeftColor: COR_PRIMARIA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  obsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COR_PRIMARIA,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  obsText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  button: {
    backgroundColor: COR_PRIMARIA,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COR_PRIMARIA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});