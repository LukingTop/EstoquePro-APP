import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import api from '../services/api';

// ── Design  ─────────────────────────────
const COR_PRIMARIA = '#4c1d95';
const COR_FUNDO = '#F8FAFC';
const COR_CARD = '#FFFFFF';
const COR_BORDA = '#E2E8F0';
const COR_TEXTO_ESCURO = '#0F172A';
const COR_TEXTO_MEDIO = '#64748B';

export default function AvariaScreen() {
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [tipoUnidade, setTipoUnidade] = useState('unidade');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  const [produtos, setProdutos] = useState<any[]>([]);
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState('');

  const [conversao, setConversao] = useState<any>(null);

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const res = await api.get('/produtos/');
        setProdutos(res.data.results || res.data);
      } catch (e) {
        console.log(e);
      }
    };
    carregarProdutos();
  }, []);

  // Busca conversão quando codigo, quantidade ou tipoUnidade mudam
  useEffect(() => {
    if (!codigo || !quantidade) return;
    const buscarConversao = async () => {
      try {
        const res = await api.get(
          `/conversao-avaria/?codigo=${codigo}&quantidade=${quantidade}&tipo_unidade=${tipoUnidade}`
        );
        setConversao(res.data);
      } catch {
        setConversao(null);
      }
    };
    buscarConversao();
  }, [codigo, quantidade, tipoUnidade]);

  const produtosFiltrados = produtos.filter(
    (p) =>
      String(p.codigo).includes(buscaProduto) ||
      p.descricao.toLowerCase().includes(buscaProduto.toLowerCase())
  );

  const selecionarProduto = (item: any) => {
    setCodigo(String(item.codigo));
    setDescricao(item.descricao);
    setModalProdutoVisivel(false);
    setBuscaProduto('');
  };

  const salvarAvaria = () => {
    if (!codigo || !quantidade) {
      Alert.alert('Preencha código e quantidade');
      return;
    }
    // Pop‑up de confirmação
    Alert.alert(
      'Confirmar Registro',
      `Deseja realmente registrar avaria do produto ${codigo} com ${quantidade} ${tipoUnidade}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Registrar',
          onPress: async () => {
            setLoading(true);
            try {
              await api.post('/avarias/', {
                codigo_produto: codigo,
                descricao_produto: descricao,
                quantidade: parseFloat(quantidade),
                tipo_unidade: tipoUnidade,
                observacao,
              });
              Alert.alert('Sucesso', 'Avaria registrada com sucesso!');
              setCodigo('');
              setDescricao('');
              setQuantidade('');
              setObservacao('');
              setConversao(null);
            } catch (error) {
              Alert.alert('Erro', 'Falha ao salvar avaria.');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header roxo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro de Avaria</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Seletor de produto */}
          <Text style={styles.label}>Produto</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setModalProdutoVisivel(true)}
          >
            <Text style={{ color: codigo ? COR_TEXTO_ESCURO : '#94a3b8', fontSize: 16 }}>
              {codigo ? `${codigo} - ${descricao}` : 'Selecionar produto'}
            </Text>
          </TouchableOpacity>

          {/* Quantidade */}
          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Quantidade"
            placeholderTextColor="#94a3b8"
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />

          {/* Tipo de unidade */}
          <Text style={styles.label}>Tipo de Unidade</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={tipoUnidade}
              onValueChange={(itemValue) => setTipoUnidade(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Unidade" value="unidade" />
              <Picker.Item label="Pack" value="pack" />
              <Picker.Item label="Pallet" value="pallet" />
            </Picker>
          </View>

          {/* Exibição da conversão */}
          {conversao && (
            <View style={styles.conversaoBox}>
              <Text style={styles.conversaoTitle}>Conversão:</Text>
              <Text style={styles.conversaoText}>
                {conversao.quantidade_original} {conversao.tipo_original} equivale a:
              </Text>
              <Text style={styles.conversaoText}>
                🔹 {conversao.total_unidades || '-'} unidades
              </Text>
              <Text style={styles.conversaoText}>
                📦 {conversao.total_packs || '-'} packs
              </Text>
              <Text style={styles.conversaoText}>
                🚚 {conversao.total_pallets || '-'} pallets
              </Text>
            </View>
          )}

          {/* Observação */}
          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Observação (opcional)"
            placeholderTextColor="#94a3b8"
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={3}
          />

          {/* Botão de salvar */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={salvarAvaria}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>REGISTRAR AVARIA</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Modal de produtos */}
      <Modal visible={modalProdutoVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Produto</Text>
              <TouchableOpacity onPress={() => setModalProdutoVisivel(false)}>
                <Ionicons name="close" size={24} color={COR_TEXTO_MEDIO} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COR_TEXTO_MEDIO} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar código ou descrição..."
                placeholderTextColor="#94a3b8"
                value={buscaProduto}
                onChangeText={setBuscaProduto}
              />
            </View>

            <FlatList
              data={produtosFiltrados}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selecionarProduto(item)}
                >
                  <Text style={styles.modalItemCode}>{item.codigo}</Text>
                  <Text style={styles.modalItemDesc}>{item.descricao}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: COR_TEXTO_MEDIO, marginTop: 20 }}>
                  Nenhum produto encontrado.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COR_FUNDO },
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COR_BORDA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COR_TEXTO_MEDIO,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COR_CARD,
    borderWidth: 1,
    borderColor: COR_BORDA,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: COR_TEXTO_ESCURO,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COR_BORDA,
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: { backgroundColor: COR_CARD },
  conversaoBox: {
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  conversaoTitle: { fontWeight: 'bold', color: COR_PRIMARIA, marginBottom: 6 },
  conversaoText: { fontSize: 14, color: COR_TEXTO_ESCURO, marginBottom: 2 },
  button: {
    backgroundColor: COR_PRIMARIA,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: COR_PRIMARIA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COR_FUNDO,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COR_TEXTO_ESCURO,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COR_CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COR_BORDA,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: { flex: 1, height: 44, fontSize: 16, color: COR_TEXTO_ESCURO },
  modalItem: {
    backgroundColor: COR_CARD,
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COR_BORDA,
  },
  modalItemCode: { fontSize: 16, fontWeight: 'bold', color: COR_PRIMARIA },
  modalItemDesc: { fontSize: 13, color: COR_TEXTO_MEDIO, marginTop: 4 },
});