import { GlobalStyles, cores } from '@/styles/GlobalStyles';
import { Stack, useRouter } from 'expo-router';
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
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import api from '../services/api';

export default function Stage() {
  const router = useRouter();
  
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
        setListaProdutos(response.data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    };
    carregarProdutos();
  }, []);

  const produtosFiltrados = listaProdutos.filter((p) => 
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
      await api.post('/registrar-stage/', {
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
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      contentContainerStyle={[
        GlobalStyles.scrollContainer,
        { justifyContent: 'flex-start', paddingBottom: 40 }
      ]}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={80}
      extraHeight={100}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: 'Stage' }} />

      <View style={GlobalStyles.header}>
        <View style={[GlobalStyles.iconContainerGeral, { backgroundColor: cores.iconeFundoAzul }]}>
          <Text style={{ fontSize: 40 }}>📦</Text>
        </View>
        <Text style={GlobalStyles.titulo}>Área de Stage</Text>
        <Text style={GlobalStyles.subtitulo}>Edição Livre</Text>
      </View>

      <View style={GlobalStyles.card}>
        <Text style={[GlobalStyles.subtitulo, { marginBottom: 5, fontWeight: 'bold' }]}>Local/Identificação (Opcional)</Text>
        <View style={GlobalStyles.inputContainer}>
          <Text style={GlobalStyles.inputIcon}>📍</Text>
          <TextInput
            style={GlobalStyles.input}
            placeholder="Ex: Recebimento..."
            value={localLivre}
            onChangeText={setLocalLivre}
            placeholderTextColor={cores.textoMutado}
            returnKeyType="next"
            onSubmitEditing={() => quantidadeRef.current?.focus()} 
            blurOnSubmit={false}
          />
        </View>

        <Text style={[GlobalStyles.subtitulo, { marginBottom: 5, fontWeight: 'bold' }]}>Código do Produto</Text>
        <TouchableOpacity 
          style={GlobalStyles.inputContainer} 
          onPress={() => setModalProdutoVisible(true)}
        >
          <Text style={GlobalStyles.inputIcon}>🏷️</Text>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {produto ? (
              <>
                <Text style={{ color: cores.texto, fontWeight: 'bold', fontSize: 16 }}>{produto}</Text>
                <Text style={{ color: cores.textoMutado, fontSize: 12 }} numberOfLines={1}>
                  {descricaoProduto}
                </Text>
              </>
            ) : (
              <Text style={{ color: cores.textoMutado, fontSize: 16 }}>Selecione o produto</Text>
            )}
          </View>
        </TouchableOpacity>

        <Text style={[GlobalStyles.subtitulo, { marginBottom: 5, fontWeight: 'bold' }]}>Quantidade</Text>
        <View style={GlobalStyles.inputContainer}>
          <Text style={GlobalStyles.inputIcon}>🔢</Text>
          <TextInput
            ref={quantidadeRef} 
            style={GlobalStyles.input}
            placeholder="Quantidade total"
            value={quantidade}
            onChangeText={setQuantidade}
            placeholderTextColor={cores.textoMutado}
            keyboardType="numeric"
            returnKeyType="next"
            onSubmitEditing={() => observacaoRef.current?.focus()} 
            blurOnSubmit={false}
          />
        </View>

        <Text style={[GlobalStyles.subtitulo, { marginBottom: 5, fontWeight: 'bold' }]}>Observação (Opcional)</Text>
        <View style={GlobalStyles.inputContainer}>
          <Text style={GlobalStyles.inputIcon}>💬</Text>
          <TextInput
            ref={observacaoRef} 
            style={GlobalStyles.input}
            placeholder="Detalhes adicionais..."
            value={observacao}
            onChangeText={setObservacao}
            placeholderTextColor={cores.textoMutado}
            returnKeyType="send"
            onSubmitEditing={handleSalvar} 
          />
        </View>

        <TouchableOpacity 
          style={[GlobalStyles.btn, GlobalStyles.btnPrimario, loading && GlobalStyles.btnDisabled]} 
          onPress={handleSalvar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={cores.cartao} />
          ) : (
            <Text style={GlobalStyles.btnTexto}>REGISTRAR STAGE</Text>
          )}
        </TouchableOpacity>
      </View>

     
      <Modal visible={modalProdutoVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={GlobalStyles.titulo}>Selecione o Produto</Text>
              <TouchableOpacity onPress={() => setModalProdutoVisible(false)}>
                <Text style={{ color: cores.statusDivergente, fontWeight: 'bold', fontSize: 18 }}>X</Text>
              </TouchableOpacity>
            </View>

            <View style={GlobalStyles.inputContainer}>
              <Text style={GlobalStyles.inputIcon}>🔍</Text>
              <TextInput
                style={GlobalStyles.input}
                placeholder="Buscar código ou descrição..."
                value={searchProduto}
                onChangeText={setSearchProduto}
                placeholderTextColor={cores.textoMutado}
                autoFocus={true}
                showSoftInputOnFocus={false}  
              />
            </View>

            <FlatList
              data={produtosFiltrados}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => selecionarProduto(item)}>
                  <Text style={styles.modalItemTitle}>{item.codigo}</Text>
                  <Text style={styles.modalItemSub}>{item.descricao}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: cores.textoMutado, marginTop: 20 }}>
                  Nenhum produto encontrado.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: cores.fundo,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    height: '80%',
  },
  modalItem: {
    backgroundColor: cores.cartao,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.texto,
  },
  modalItemSub: {
    fontSize: 13,
    color: cores.textoMutado,
    marginTop: 3,
  }
});