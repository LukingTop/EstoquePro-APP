import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { router } from 'expo-router';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function SelecionarSessao() {
  const [sessoes, setSessoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await api.get('/sessoes/');
        const dados = response.data.results || response.data;
        // Apenas sessões ativas (já filtradas pelo backend para não‑staff)
        const ativas = Array.isArray(dados) ? dados.filter((s: any) => s.ativo) : [];
        setSessoes(ativas);
      } catch (error: any) {
        Alert.alert('Erro', 'Não foi possível carregar as sessões.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const selecionar = (sessao: any) => {
    router.push({
      pathname: '/',
      params: {
        sessao_id: sessao.id,
        sessao_titulo: sessao.titulo,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: '#64748b' }}>Carregando sessões...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Escolha a Sessão de Contagem</Text>
      <FlatList
        data={sessoes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => selecionar(item)}>
            <View style={styles.cardHeader}>
              <Ionicons name="folder-open-outline" size={24} color="#2563eb" />
              <Text style={styles.titulo}>{item.titulo}</Text>
            </View>
            <Text style={styles.ruas}>
              Ruas: {item.ruas_codigos?.join(', ') || 'Todas disponíveis'}
            </Text>
            <Text style={styles.tipo}>
              Tipo: {item.tipo || '1ª Contagem'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="sad-outline" size={48} color="#94a3b8" />
            <Text style={{ marginTop: 12, color: '#64748b', fontSize: 16 }}>Nenhuma sessão ativa no momento.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 12,
    flex: 1,
  },
  ruas: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
  },
  tipo: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
});