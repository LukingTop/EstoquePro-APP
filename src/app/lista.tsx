import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import api from '../services/api';
import { cores, GlobalStyles } from '../styles/GlobalStyles';

export default function ListaScreen() {
  const [contagens, setContagens] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEdicao, setIdEdicao] = useState<number | null>(null);
  const [operador, setOperador] = useState('');
  const [endereco, setEndereco] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pallets, setPallets] = useState('');
  const [obs, setObs] = useState('');

  const enderecoRef = useRef<TextInput>(null);
  const codigoRef = useRef<TextInput>(null);
  const palletsRef = useRef<TextInput>(null);
  const obsRef = useRef<TextInput>(null);

  useEffect(() => {
    carregarContagens();
  }, []);

  const carregarContagens = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        router.replace('/login');
        return;
      }
      const response = await api.get('/contagens/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dados = response.data.results || response.data;
      setContagens(dados);
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Sessão Expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
        await SecureStore.deleteItemAsync('userToken');
        router.replace('/login');
      } else {
        Alert.alert('Erro', 'Falha ao buscar dados.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarContagens();
  };

  const confirmarExclusao = (id: number) => {
    Alert.alert('Apagar', 'Excluir registro permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deletarContagem(id) },
    ]);
  };

  const deletarContagem = async (id: number) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await api.delete(`/contagens/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      carregarContagens();
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Sessão Expirada', 'Faça login novamente.');
        router.replace('/login');
      } else {
        Alert.alert('Erro', 'Falha ao excluir.');
      }
    }
  };

  const abrirEdicao = (item: any) => {
    setIdEdicao(item.id);
    setOperador(item.operador);
    setEndereco(item.endereco || item.rua || '');
    setCodigo(item.codigo_produto);
    setDescricao(item.descricao_produto);
    setPallets(item.pallets.toString());
    setObs(item.observacao || '');
    setModoEdicao(true);
  };

  const salvarEdicao = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await api.put(
        `/contagens/${idEdicao}/`,
        {
          operador,
          endereco: endereco,
          codigo_produto: codigo,
          descricao_produto: descricao,
          pallets: parseInt(pallets),
          observacao: obs,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModoEdicao(false);
      carregarContagens();
      Alert.alert('Sucesso', 'Contagem atualizada no servidor!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Sessão Expirada', 'Faça login novamente.');
        router.replace('/login');
      } else {
        Alert.alert('Erro', 'Falha ao atualizar.');
      }
    }
  };

  const exportarCSV = async () => {
    if (contagens.length === 0) return Alert.alert('Aviso', 'Lista vazia.');
    let csv = 'ID;Operador;Endereco;Codigo;Descricao;Pallets;Observacao\n';
    contagens.forEach(
      (i) =>
        (csv += `${i.id};${i.operador};${i.endereco || i.rua};${i.codigo_produto};${i.descricao_produto};${i.pallets};${i.observacao || ''}\n`)
    );
   
    const path = FileSystem.documentDirectory + 'contagem.csv';
    await FileSystem.writeAsStringAsync(path, csv, { encoding: 'utf8' });
    await Sharing.shareAsync(path);
  };

  const repetirContagem = async (item: any) => {
    await SecureStore.setItemAsync(
      'pendingRepeat',
      JSON.stringify({
        rua: String(item.rua_codigo || ''),
        endereco: String(item.endereco || ''),
        codigo: String(item.codigo_produto || ''),
        descricao: String(item.descricao_produto || ''),
      })
    );
    router.navigate('/');
  };

  if (modoEdicao) {
    return (
      <View style={GlobalStyles.container}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.containerModal}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={120}
        >
          <View style={GlobalStyles.card}>
            <View style={styles.headerEdicao}>
              <Ionicons name="create-outline" size={28} color={cores.primaria} />
              <Text style={GlobalStyles.titulo}>Editar</Text>
            </View>

            <Text style={styles.label}>Operador</Text>
            <View style={GlobalStyles.inputContainer}>
              <TextInput style={GlobalStyles.input} value={operador} onChangeText={setOperador} editable={false} />
            </View>

            <Text style={styles.label}>Endereço</Text>
            <View style={GlobalStyles.inputContainer}>
              <TextInput ref={enderecoRef} style={GlobalStyles.input} value={endereco} onChangeText={setEndereco} />
            </View>

            <Text style={styles.label}>Código do Produto</Text>
            <View style={GlobalStyles.inputContainer}>
              <TextInput ref={codigoRef} style={GlobalStyles.input} value={codigo} onChangeText={setCodigo} />
            </View>

            <Text style={styles.label}>Pallets</Text>
            <View style={[GlobalStyles.inputContainer, { borderColor: cores.primaria }]}>
              <TextInput
                ref={palletsRef}
                style={GlobalStyles.input}
                value={pallets}
                onChangeText={setPallets}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.label}>Observação</Text>
            <View style={GlobalStyles.inputContainer}>
              <TextInput ref={obsRef} style={GlobalStyles.input} value={obs} onChangeText={setObs} />
            </View>

            <View style={styles.linhaBotoes}>
              <TouchableOpacity
                style={[GlobalStyles.btn, styles.btnCancelar]}
                onPress={() => setModoEdicao(false)}
              >
                <Text style={styles.btnTextoCancelar}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[GlobalStyles.btn, GlobalStyles.btnPrimario, { flex: 1 }]}
                onPress={salvarEdicao}
              >
                <Text style={GlobalStyles.btnTexto}>SALVAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <View style={styles.headerExport}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={cores.texto} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnExportar} onPress={exportarCSV}>
          <Ionicons name="share-outline" size={18} color={cores.cartao} />
          <Text style={GlobalStyles.btnTexto}>EXPORTAR CSV</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contagens}
        contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
        keyExtractor={(i) => i.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[cores.primaria]} />
        }
        renderItem={({ item }) => (
          <View style={styles.cardItem}>
            <View style={styles.linhaCabecalhoItem}>
              <View style={styles.badgeEndereco}>
                <Ionicons name="location" size={12} color={cores.cartao} style={{ marginRight: 4 }} />
                <Text style={styles.textoBadge}>{item.endereco || item.rua}</Text>
              </View>
              <Text style={styles.itemOperador}>
                <Ionicons name="person" size={12} /> {item.operador}
              </Text>
            </View>

            <View style={styles.infoCorpo}>
              <Text style={styles.itemCodigo}>
                {item.codigo_produto} - {item.descricao_produto}
              </Text>
              <Text style={styles.itemPallets}>{item.pallets} Pallets</Text>
              {item.observacao ? (
                <Text style={styles.itemObs} numberOfLines={1}>Obs: {item.observacao}</Text>
              ) : null}
            </View>

            <View style={styles.linhaAcoesItem}>
              <TouchableOpacity
                style={styles.btnRepetir}
                onPress={() => repetirContagem(item)}
              >
                <Ionicons name="refresh-outline" size={16} color={cores.textoMutado} />
                <Text style={styles.btnRepetirTexto}>REPETIR</Text>
              </TouchableOpacity>

              <View style={styles.grupoAcoesDir}>
                <TouchableOpacity onPress={() => abrirEdicao(item)} style={styles.btnIconeEdicao}>
                  <Ionicons name="pencil" size={18} color={cores.primaria} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmarExclusao(item.id)}
                  style={styles.btnIconeExcluir}
                >
                  <Ionicons name="trash" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.vazioContainer}>
            <Ionicons name="folder-open-outline" size={48} color={cores.borda} />
            <Text style={styles.textoVazio}>Nenhuma contagem registrada ainda.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  containerModal: { padding: 20, paddingBottom: 60, marginTop: 20 },
  headerEdicao: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10, justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: cores.textoMutado, marginBottom: 5, textTransform: 'uppercase' },
  
  linhaBotoes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 15 },
  btnCancelar: { flex: 1, backgroundColor: cores.fundo, borderWidth: 1, borderColor: cores.borda, elevation: 0 },
  btnTextoCancelar: { color: cores.textoMutado, fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
  
  headerExport: {
    padding: 15,
    paddingTop: 50,
    backgroundColor: cores.cartao,
    borderBottomWidth: 1,
    borderColor: cores.borda,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  btnVoltar: { padding: 8, backgroundColor: cores.cinzaClaro, borderRadius: 10 },
  btnExportar: {
    backgroundColor: cores.sucesso,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: cores.sucesso,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  
  cardItem: { 
    backgroundColor: cores.cartao, 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 6, 
    elevation: 2 
  },
  linhaCabecalhoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badgeEndereco: {
    backgroundColor: cores.primaria,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  textoBadge: { color: cores.cartao, fontWeight: 'bold', fontSize: 13 },
  itemOperador: { fontSize: 13, color: cores.textoMutado, fontWeight: '600', backgroundColor: cores.fundo, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  
  infoCorpo: { marginBottom: 15 },
  itemCodigo: { fontSize: 17, fontWeight: '700', color: cores.texto, marginBottom: 4 },
  itemPallets: { fontSize: 15, color: cores.sucesso, fontWeight: '700' },
  itemObs: { fontSize: 13, color: cores.desativado, fontStyle: 'italic', marginTop: 4 },

  linhaAcoesItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: cores.fundo,
    paddingTop: 15,
  },
  btnRepetir: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.cinzaClaro,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  btnRepetirTexto: { color: cores.textoMutado, fontWeight: 'bold', fontSize: 13 },
  grupoAcoesDir: { flexDirection: 'row', gap: 12 },
  btnIconeEdicao: { padding: 10, backgroundColor: cores.iconeFundoAzul, borderRadius: 10 },
  btnIconeExcluir: { padding: 10, backgroundColor: '#fef2f2', borderRadius: 10 },
  
  vazioContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 15 },
  textoVazio: { color: cores.desativado, fontSize: 16, fontWeight: '500' }
});