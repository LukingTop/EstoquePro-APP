import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GlobalStyles, cores } from '../styles/GlobalStyles';
import api from '../services/api';                    // ← necessário para a chamada real

export default function DashboardProgresso() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [palletsContados, setPalletsContados] = useState(0);
  const [missoesConcluidas, setMissoesConcluidas] = useState(0);

  const META_DIARIA_PALLETS = 150;

  const carregarDados = useCallback(async () => {
    try {
      // Chama o novo endpoint que retorna os dados reais do operador logado
      const response = await api.get('/operador/produtividade-diaria/');
      setPalletsContados(response.data.total_pallets || 0);
      setMissoesConcluidas(response.data.missoes_concluidas || 0);
    } catch (error) {
      console.error('Erro ao carregar produtividade:', error);
      // Em caso de erro, mantém os valores zerados (pode exibir uma mensagem)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const porcentagemMeta = Math.min(
    Math.round((palletsContados / META_DIARIA_PALLETS) * 100),
    100
  );

  if (loading) {
    return (
      <View style={[styles.centro, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={{ marginTop: 10, color: cores.textoMutado }}>Carregando seu progresso...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      {/* Cabeçalho com botão voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color={cores.texto} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Meu Progresso</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[GlobalStyles.scrollContainer, { paddingBottom: 40 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[cores.primaria]} />
        }
      >
        <View style={GlobalStyles.header}>
          <View style={[GlobalStyles.iconContainerGeral, { backgroundColor: cores.iconeFundoAzul }]}>
            <Text style={{ fontSize: 40 }}>📊</Text>
          </View>
          <Text style={GlobalStyles.titulo}>Desempenho do Turno</Text>
          <Text style={GlobalStyles.subtitulo}>Acompanhe sua produtividade hoje</Text>
        </View>

        {/* Card da Barra de Progresso */}
        <View style={GlobalStyles.card}>
          <View style={styles.metaHeader}>
            <Text style={styles.metaTitulo}>Meta de Movimentação</Text>
            <Text style={styles.metaPorcentagem}>{porcentagemMeta}%</Text>
          </View>
          <View style={styles.barraTrilho}>
            <View style={[styles.barraPreenchimento, { width: `${porcentagemMeta}%` }]} />
          </View>
          <Text style={styles.metaSubtexto}>
            {palletsContados} de {META_DIARIA_PALLETS} pallets registrados hoje.
            {porcentagemMeta >= 100 ? ' 🎉 Meta batida!' : ''}
          </Text>
        </View>

        {/* Grid de Estatísticas */}
        <View style={styles.gridContainer}>
          <View style={[GlobalStyles.card, styles.miniCard]}>
            <Text style={styles.emojiGrande}>📦</Text>
            <Text style={styles.miniCardValor}>{palletsContados}</Text>
            <Text style={styles.miniCardLabel}>Pallets Bipados</Text>
          </View>
          <View style={[GlobalStyles.card, styles.miniCard]}>
            <Text style={styles.emojiGrande}>🎯</Text>
            <Text style={styles.miniCardValor}>{missoesConcluidas}</Text>
            <Text style={styles.miniCardLabel}>Recontagens</Text>
          </View>
        </View>

        <Text style={{ color: cores.textoMutado, textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          💡 Puxe a tela para baixo para atualizar seus números.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: cores.cartao,
    borderBottomWidth: 1,
    borderColor: cores.borda,
  },
  btnVoltar: {
    padding: 8,
    backgroundColor: cores.cinzaClaro,
    borderRadius: 10,
  },
  tituloHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.texto,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.texto,
  },
  metaPorcentagem: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.primaria,
  },
  barraTrilho: {
    height: 14,
    backgroundColor: cores.borda,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barraPreenchimento: {
    height: '100%',
    backgroundColor: cores.primaria,
    borderRadius: 7,
  },
  metaSubtexto: {
    fontSize: 14,
    color: cores.textoMutado,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 5,
  },
  miniCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  emojiGrande: {
    fontSize: 32,
    marginBottom: 8,
  },
  miniCardValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.texto,
  },
  miniCardLabel: {
    fontSize: 13,
    color: cores.textoMutado,
    marginTop: 2,
    textAlign: 'center',
  },
});