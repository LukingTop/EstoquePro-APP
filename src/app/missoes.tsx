import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import api from './../services/api';

export default function Missoes() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);       
  const [refreshing, setRefreshing] = useState(false); 
  const router = useRouter();

  const carregarTarefas = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await api.get('/tarefas-recontagem/');
      
      setTarefas(response.data.results || response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao carregar as missões.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarTarefas(true);
  };

  const assumirMissao = async (tarefa: any) => {
    try {
      if (tarefa.status === 'PENDENTE') {
        await api.post(`/tarefas-recontagem/${tarefa.id}/assumir/`);
      }
      
      router.push({
        pathname: '/',
        params: {
          tarefa_id: tarefa.id,
          endereco_trava: tarefa.endereco_str,
          produto_trava: tarefa.produto_str,
          descricao_trava: tarefa.descricao_str,
          is_recontagem: 'true'
        }
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível assumir esta missão no momento.');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>📍 Endereço: {item.endereco_str}</Text>
        <Text style={[styles.badge, item.status === 'EM_ANDAMENTO' ? styles.badgeAndamento : styles.badgePendente]}>
          {item.status.replace('_', ' ')}
        </Text>
      </View>
      <Text style={styles.subtitle}>📦 Produto: {item.produto_str} - {item.descricao_str}</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => assumirMissao(item)}
      >
        <Text style={styles.buttonText}>ASSUMIR MISSÃO</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Buscando missões...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tarefas.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhuma missão de recontagem no momento. Ótimo trabalho!</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => onRefresh()}>
            <Text style={styles.buttonText}>ATUALIZAR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 15,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  badgePendente: {
    backgroundColor: '#e67e22',
  },
  badgeAndamento: {
    backgroundColor: '#3498db',
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  refreshButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  }
});