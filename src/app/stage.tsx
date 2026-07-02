  import { Ionicons } from '@expo/vector-icons';
  import { router } from 'expo-router';
  import React, { useEffect, useRef, useState } from 'react';
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
  import api from '../services/api';

  // ── Design  ─────────────────────────────
  const COR_PRIMARIA = '#4c1d95';
  const COR_FUNDO = '#F8FAFC';
  const COR_CARD = '#FFFFFF';
  const COR_BORDA = '#E2E8F0';
  const COR_TEXTO_ESCURO = '#0F172A';
  const COR_TEXTO_MEDIO = '#64748B';

  export default function Stage() {
    const [localLivre, setLocalLivre] = useState('');
    const [produto, setProduto] = useState('');
    const [descricaoProduto, setDescricaoProduto] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [observacao, setObservacao] = useState('');
    const [loading, setLoading] = useState(false);

    const [listaProdutos, setListaProdutos] = useState<any[]>([]);
    const [modalProdutoVisible, setModalProdutoVisible] = useState(false);
    const [searchProduto, setSearchProduto] = useState('');

    const quantidadeRef = useRef<TextInput>(null);
    const observacaoRef = useRef<TextInput>(null);

    useEffect(() => {
      const carregarProdutos = async () => {
        try {
          const response = await api.get('/produtos/');
          setListaProdutos(response.data.results || response.data);
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
        }
      };
      carregarProdutos();
    }, []);

    const produtosFiltrados = listaProdutos.filter(
      (p) =>
        String(p.codigo).includes(searchProduto) ||
        p.descricao.toLowerCase().includes(searchProduto.toLowerCase())
    );

    const selecionarProduto = (item: any) => {
      setProduto(String(item.codigo));
      setDescricaoProduto(item.descricao);
      setModalProdutoVisible(false);
      setSearchProduto('');
      setTimeout(() => {
        quantidadeRef.current?.focus();
      }, 300);
    };

    const handleSalvar = async () => {
      if (!produto || !quantidade) {
        Alert.alert('Atenção', 'Preencha pelo menos o Código do Produto e a Quantidade.');
        return;
      }

      setLoading(true);
      try {
        await api.post('/contagens-stage/', {
          local: localLivre || 'STAGE',
          produto: produto,
          quantidade: quantidade,
          observacao: observacao,
        });

        Alert.alert('Sucesso', 'Registro de Stage salvo com sucesso!');

        setLocalLivre('');
        setProduto('');
        setDescricaoProduto('');
        setQuantidade('');
        setObservacao('');
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível salvar o registro de Stage.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <View style={styles.container}>
        {/* Header roxo */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lançamento Livre</Text>
          <View style={styles.headerBtn} />
        </View>

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={120}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Local (opcional) */}
            <Text style={styles.label}>Local / Identificação</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Recebimento..."
              placeholderTextColor="#94a3b8"
              value={localLivre}
              onChangeText={setLocalLivre}
              returnKeyType="next"
              onSubmitEditing={() => quantidadeRef.current?.focus()}
              blurOnSubmit={false}
            />

            {/* Código do Produto */}
            <Text style={styles.label}>Código do Produto</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setModalProdutoVisible(true)}
            >
              {produto ? (
                <View>
                  <Text style={{ color: COR_TEXTO_ESCURO, fontWeight: 'bold', fontSize: 16 }}>
                    {produto}
                  </Text>
                  <Text style={{ color: COR_TEXTO_MEDIO, fontSize: 12 }} numberOfLines={1}>
                    {descricaoProduto}
                  </Text>
                </View>
              ) : (
                <Text style={{ color: '#94a3b8', fontSize: 16 }}>Selecione o produto</Text>
              )}
            </TouchableOpacity>

            {/* Quantidade */}
            <Text style={styles.label}>Quantidade</Text>
            <TextInput
              ref={quantidadeRef}
              style={styles.input}
              placeholder="Quantidade total"
              placeholderTextColor="#94a3b8"
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => observacaoRef.current?.focus()}
              blurOnSubmit={false}
            />

            {/* Observação */}
            <Text style={styles.label}>Observação</Text>
            <TextInput
              ref={observacaoRef}
              style={[styles.input, styles.textArea]}
              placeholder="Detalhes adicionais..."
              placeholderTextColor="#94a3b8"
              value={observacao}
              onChangeText={setObservacao}
              multiline
              numberOfLines={3}
              returnKeyType="send"
              onSubmitEditing={handleSalvar}
            />

            {/* Botão */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>REGISTRAR STAGE</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>

        {/* Modal de produtos */}
        <Modal visible={modalProdutoVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione o Produto</Text>
                <TouchableOpacity onPress={() => setModalProdutoVisible(false)}>
                  <Ionicons name="close" size={24} color={COR_TEXTO_MEDIO} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COR_TEXTO_MEDIO} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar código ou descrição..."
                  placeholderTextColor="#94a3b8"
                  value={searchProduto}
                  onChangeText={setSearchProduto}
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
      justifyContent: 'center',
    },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
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