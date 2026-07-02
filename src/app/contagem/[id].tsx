import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import api from '../../services/api';
import { getEnderecosOffline, cacheEnderecos } from '../../services/offlineStorage';

import HeaderContagem from '../../components/contagem/HeaderContagem';
import OfflineBanner from '../../components/contagem/OfflineBanner';
import StatusBanners from '../../components/contagem/StatusBanners';
import CardInicial from '../../components/contagem/CardInicial';
import HeaderProgresso from '../../components/contagem/HeaderProgresso';
import CardEnderecoAtual from '../../components/contagem/CardEnderecoAtual';
import CardProdutoInput from '../../components/contagem/CardProdutoInput';
import FormContagem from '../../components/contagem/FormContagem';
import ModalSelecionarRua from '../../components/contagem/ModalSelecionarRua';
import ModalSelecionarProduto from '../../components/contagem/ModalSelecionarProduto';

export default function ContagemScreen() {
  const params = useLocalSearchParams<{
    id: string;
    is_recontagem?: string;
    tarefa_id?: string;
    endereco_trava?: string;
    produto_trava?: string;
    sessao_id?: string;
    sessao_titulo?: string;
    descricao_trava?: string;
  }>();

  const isRecontagem = params.is_recontagem === 'true';
  const tarefaId = params.tarefa_id ?? null;
  const enderecoTrava = params.endereco_trava ?? null;
  const produtoTrava = params.produto_trava ?? null;
  const sessaoId = params.sessao_id ? Number(params.sessao_id) : null;
  const sessaoTitulo = (params.sessao_titulo as string) || '';

  const [sessaoTipo, setSessaoTipo] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pallets, setPallets] = useState('');
  const [unidades, setUnidades] = useState('');
  const [obs, setObs] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [preenchidoDoHistorico, setPreenchidoDoHistorico] = useState(false);
  const [enderecoRepetir, setEnderecoRepetir] = useState<string | null>(null);
  const [operadorLogado, setOperadorLogado] = useState('');

  const [listaProdutos, setListaProdutos] = useState<any[]>([]);
  const [listaRuas, setListaRuas] = useState<any[]>([]);
  const [listaContagens, setListaContagens] = useState<any[]>([]);
  const [filaOffline, setFilaOffline] = useState<any[]>([]);

  const [modalRuasVisivel, setModalRuasVisivel] = useState(false);
  const [stepModalRota, setStepModalRota] = useState<'RUA' | 'ENDERECO'>('RUA');
  const [buscaRua, setBuscaRua] = useState('');
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState('');

  const palletsRef = useRef<TextInput>(null);
  const unidadesRef = useRef<TextInput>(null);
  const obsRef = useRef<TextInput>(null);

  const [enderecosRota, setEnderecosRota] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ruaSelecionada, setRuaSelecionada] = useState('');
  const [carregandoRota, setCarregandoRota] = useState(false);
  const [placeholderPallets, setPlaceholderPallets] = useState('');

  const rotaAtiva = enderecosRota.length > 0 && currentIndex < enderecosRota.length;
  const enderecoAtualObj = rotaAtiva ? enderecosRota[currentIndex] : null;
  const enderecoAtual: string | null = isRecontagem
    ? enderecoTrava
    : enderecoAtualObj
    ? String(enderecoAtualObj.codigo)
    : enderecoRepetir;

  const progressoPct =
    enderecosRota.length > 0 ? Math.round((currentIndex / enderecosRota.length) * 100) : 0;

  // ─── efeitos ────────────────────────────────────────────
  useEffect(() => {
    if (isRecontagem && produtoTrava) {
      setCodigo(produtoTrava);
      setPreenchidoDoHistorico(true);
      setTimeout(() => palletsRef.current?.focus(), 600);
      if (params.descricao_trava) {
        setDescricao(params.descricao_trava);
      } else if (listaProdutos.length > 0) {
        const produto = listaProdutos.find((p) => String(p.codigo) === produtoTrava);
        if (produto) setDescricao(produto.descricao);
      }
    }
  }, [isRecontagem, produtoTrava, params.descricao_trava, listaProdutos]);

  useFocusEffect(
    useCallback(() => {
      const verificarPendingRepeat = async () => {
        if (isRecontagem) return;
        const pendingJson = await SecureStore.getItemAsync('pendingRepeat');
        if (!pendingJson) return;
        try {
          const data = JSON.parse(pendingJson);
          setEnderecoRepetir(data.endereco ?? '');
          setCodigo(data.codigo ?? '');
          setDescricao(data.descricao ?? '');
          setPallets('');
          setUnidades('');
          setObs('');
          setPreenchidoDoHistorico(true);
          setTimeout(() => palletsRef.current?.focus(), 400);
        } catch {} finally {
          await SecureStore.deleteItemAsync('pendingRepeat');
        }
      };
      verificarPendingRepeat();
    }, [isRecontagem])
  );

  useEffect(() => {
    const iniciarTela = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      const user = await SecureStore.getItemAsync('loggedUser');
      if (!token) {
        router.replace('/login');
        return;
      }
      if (user) setOperadorLogado(user);

      const fila = await obterFilaOffline();
      setFilaOffline(fila);

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const responseProdutos = await api.get('/produtos/', config);
        setListaProdutos(responseProdutos.data.results || responseProdutos.data);

        const responseRuas = await api.get('/ruas/', config);
        setListaRuas(responseRuas.data.results || responseRuas.data);

        if (sessaoId) {
          try {
            const sessionResponse = await api.get(`/sessoes/${sessaoId}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const codigos = sessionResponse.data.ruas_codigos || [];
            if (codigos.length > 0) {
              setListaRuas((prev) => prev.filter((r) => codigos.includes(r.codigo)));
            }
            setSessaoTipo(sessionResponse.data.tipo);
            if (sessionResponse.data.contagem_informada) {
              setPlaceholderPallets('Carregando referência...');
            }
          } catch (e) {
            console.error('Erro ao filtrar ruas da sessão', e);
          }
        }

        try {
          const responseContagens = await api.get('/contagens/', config);
          setListaContagens(responseContagens.data.results || responseContagens.data);
        } catch {
          console.log('Aviso: não foi possível carregar contagens para validação.');
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          Alert.alert('Sessão Expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
          await SecureStore.deleteItemAsync('userToken');
          router.replace('/login');
        } else if (!error.response) {
          Alert.alert('Modo Offline', 'Sem conexão. Contagens serão salvas no celular.');
        }
      }
    };

    iniciarTela();
  }, [sessaoId]);

  useEffect(() => {
    if (!sessaoId || !enderecoAtual || sessaoTipo !== 'PRIMEIRA') return;
    const carregarReferencia = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const response = await api.get('/contagens/', {
          headers: { Authorization: `Bearer ${token}` },
          params: { endereco: enderecoAtual, ordering: '-data_hora', page_size: 1 },
        });
        const data = response.data.results || response.data;
        const ultima = Array.isArray(data) ? data[0] : data;
        if (ultima && ultima.pallets !== undefined) {
          setPlaceholderPallets(`Referência: ${ultima.pallets} (${ultima.codigo_produto || 'último'})`);
        } else {
          setPlaceholderPallets('Sem referência anterior');
        }
      } catch {
        setPlaceholderPallets('');
      }
    };
    carregarReferencia();
  }, [enderecoAtual, sessaoId, sessaoTipo]);

  // ⚡ Início automático quando há apenas uma rua
  useEffect(() => {
    if (
      sessaoId &&
      listaRuas.length === 1 &&
      !rotaAtiva &&
      !enderecoRepetir &&
      !isRecontagem &&
      !carregandoRota
    ) {
      iniciarRota(listaRuas[0].codigo);
    }
  }, [sessaoId, listaRuas, rotaAtiva, enderecoRepetir, isRecontagem, carregandoRota]);

  // ─── funções de negócio ────────
  const obterFilaOffline = async () => {
    try {
      const dados = await SecureStore.getItemAsync('contagensOffline');
      return dados ? JSON.parse(dados) : [];
    } catch {
      return [];
    }
  };

  const handleLogout = () => {
    Alert.alert('Desconectar', 'Tem certeza que deseja sair da conta atual?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('refreshToken');
          await SecureStore.deleteItemAsync('loggedUser');
          await SecureStore.deleteItemAsync('savedUsername');
          await SecureStore.deleteItemAsync('savedPassword');
          router.replace('/login');
        },
      },
    ]);
  };

  const handleCodigoChange = async (text: string) => {
    setCodigo(text);
    if (!text.trim()) {
      setDescricao('');
      return;
    }
    const cache = await AsyncStorage.getItem('dicionarioProdutos');
    if (cache) {
      const produtosOffline = JSON.parse(cache);
      const encontrado = produtosOffline.find((p: any) => p.codigo === text.trim());
      if (encontrado) {
        setDescricao(encontrado.descricao);
        return;
      }
    }
    const produtoEncontrado = listaProdutos.find((p) => String(p.codigo) === text.trim());
    setDescricao(produtoEncontrado ? produtoEncontrado.descricao : '');
  };

  const iniciarRota = async (ruaCodigo: string) => {
    setCarregandoRota(true);
    try {
      let dados: any[] | null = null;
      try {
        dados = await getEnderecosOffline(ruaCodigo);
      } catch {}
      if (!dados || dados.length === 0) {
        const token = await SecureStore.getItemAsync('userToken');
        const response = await api.get('/enderecos/', {
          headers: { Authorization: `Bearer ${token}` },
          params: { rua_codigo: ruaCodigo },
        });
        dados = response.data.results || response.data;
        await cacheEnderecos(ruaCodigo);
      }
      if (!dados || dados.length === 0) {
        Alert.alert('Atenção', `Nenhum endereço encontrado para a rua ${ruaCodigo}.`);
        setCarregandoRota(false);
        return;
      }
      setEnderecosRota(dados);
      setRuaSelecionada(ruaCodigo);
      setStepModalRota('ENDERECO');
      setEnderecoRepetir(null);
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Sessão Expirada', 'Faça login novamente.');
        await SecureStore.deleteItemAsync('userToken');
        router.replace('/login');
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os endereços desta rua.');
      }
    } finally {
      setCarregandoRota(false);
    }
  };

  const avancarRota = async () => {
    if (!rotaAtiva) {
      resetParaTelaInicial();
      return;
    }
    const proximo = currentIndex + 1;
    limparFormulario();
    if (proximo >= enderecosRota.length) {
      if (sessaoId && sessaoTipo !== 'AVARIA') {
        try {
          const token = await SecureStore.getItemAsync('userToken');
          await api.patch(`/sessoes/${sessaoId}/finalizar/`, null, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          console.error('Erro ao finalizar sessão', e);
        }
      }
      Alert.alert(
        '✅ Rota Concluída!',
        `Você finalizou a contagem da rua ${ruaSelecionada}.\n${enderecosRota.length} endereços processados.`,
        [{ text: 'OK', onPress: resetParaTelaInicial }]
      );
    } else {
      setCurrentIndex(proximo);
    }
  };

  const voltarRota = () => {
    if (!rotaAtiva || currentIndex === 0) return;
    setCurrentIndex(currentIndex - 1);
    limparFormulario();
  };

  const pularEndereco = () => {
    if (!enderecoAtual) return;
    Alert.alert(
      'Pular Endereço?',
      `O endereço ${enderecoAtual} será pulado sem registrar contagem.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Pular', style: 'destructive', onPress: avancarRota },
      ]
    );
  };

  const salvarContagem = async () => {
    if (salvando || !enderecoAtual) return;
    if (!codigo || !pallets) {
      Alert.alert('Campos obrigatórios', 'Preencha Produto e Pallets.');
      return;
    }
    if (!descricao && !isRecontagem) {
      Alert.alert('Erro', 'Produto não encontrado na base. Verifique o código.');
      return;
    }
    setSalvando(true);
    const payload: any = {
      endereco: enderecoAtual,
      codigo_produto: codigo,
      descricao_produto: descricao || 'Produto da Recontagem',
      pallets: parseInt(pallets),
      unidades: unidades ? parseInt(unidades) : undefined,
      observacao: obs,
      id_local: Date.now().toString(),
      sessao: sessaoId,
    };
    if (isRecontagem) {
      payload.e_recontagem = true;
      payload.tarefa_recontagem = tarefaId;
    }
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await api.post('/contagens/', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isRecontagem) {
        try {
          await api.patch(`/tarefas-recontagem/${tarefaId}/`, { status: 'CONCLUIDO' }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {}
        Alert.alert('✅ Missão Cumprida', 'Estoque ajustado e conflito resolvido!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }
      if (sessaoTipo === 'AVARIA' && rotaAtiva && currentIndex + 1 >= enderecosRota.length) {
        setSalvando(false);
        Alert.alert('Finalizar Avaria?', 'Deseja realmente encerrar a contagem de avaria?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Encerrar',
            onPress: async () => {
              const token2 = await SecureStore.getItemAsync('userToken');
              await api.patch(`/sessoes/${sessaoId}/finalizar/`, null, {
                headers: { Authorization: `Bearer ${token2}` },
              });
              Alert.alert('✅ Avaria Finalizada!', 'A sessão foi encerrada com sucesso.');
              resetParaTelaInicial();
            },
          },
        ]);
        return;
      }
      setListaContagens((prev) => [{ ...payload, data_hora: new Date().toISOString() }, ...prev]);
      avancarRota();
      Keyboard.dismiss();
    } catch (error: any) {
      if (!error.response && !isRecontagem) {
        const filaAtual = await obterFilaOffline();
        filaAtual.push({ ...payload, id_local: Date.now().toString() });
        await SecureStore.setItemAsync('contagensOffline', JSON.stringify(filaAtual));
        setFilaOffline(filaAtual);
        avancarRota();
      } else if (!error.response && isRecontagem) {
        Alert.alert('Sem Conexão', 'Você precisa de internet para finalizar uma missão de recontagem.');
      } else if (error.response?.status === 401) {
        Alert.alert('Sessão Expirada', 'Faça login novamente.');
        await SecureStore.deleteItemAsync('userToken');
        router.replace('/login');
      } else {
        Alert.alert('Erro', 'Falha ao enviar para o servidor. Tente novamente.');
      }
    } finally {
      setSalvando(false);
      Keyboard.dismiss();
    }
  };

  const limparFormulario = () => {
    setCodigo('');
    setDescricao('');
    setPallets('');
    setUnidades('');
    setObs('');
    setPreenchidoDoHistorico(false);
  };

  const sincronizarPendentes = async () => {
    if (salvando) return;
    setSalvando(true);
    const filaPendente = await obterFilaOffline();
    const contagensComErro: any[] = [];
    let sincronizadas = 0;
    const token = await SecureStore.getItemAsync('userToken');
    for (const item of filaPendente) {
      try {
        await api.post('/contagens/', {
          endereco: item.endereco,
          codigo_produto: item.codigo_produto,
          descricao_produto: item.descricao_produto,
          pallets: item.pallets,
          unidades: item.unidades,
          observacao: item.observacao,
          id_local: item.id_local,
        }, { headers: { Authorization: `Bearer ${token}` } });
        sincronizadas++;
      } catch (error: any) {
        if (error.response?.status === 401) {
          Alert.alert('Sessão Expirada', 'Sua sessão expirou. Faça login para continuar.');
          await SecureStore.deleteItemAsync('userToken');
          router.replace('/login');
          setSalvando(false);
          return;
        }
        contagensComErro.push(item);
      }
    }
    await SecureStore.setItemAsync('contagensOffline', JSON.stringify(contagensComErro));
    setFilaOffline(contagensComErro);
    setSalvando(false);
    if (contagensComErro.length === 0) {
      Alert.alert('Sincronização Completa', `${sincronizadas} contagens enviadas com sucesso!`);
    } else if (sincronizadas > 0) {
      Alert.alert('Aviso', `${sincronizadas} enviadas, mas restaram ${contagensComErro.length} com erro.`);
    } else {
      Alert.alert('Falha', 'Nenhuma contagem pôde ser enviada. Verifique sua internet.');
    }
  };

  const confirmarCancelarRota = () => {
    if (isRecontagem) {
      Alert.alert('Cancelar Missão?', 'Deseja abandonar a recontagem e voltar?', [
        { text: 'Não', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => router.back() },
      ]);
      return;
    }

    // Se a sessão tem apenas uma rua, voltar para a lista de ciclos
    if (sessaoId && listaRuas.length === 1) {
      Alert.alert('Sair da Contagem', 'Deseja sair da contagem e voltar para os ciclos?', [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            resetParaTelaInicial();
            router.push('/(tabs)/ciclos' as any);
          },
        },
      ]);
      return;
    }

    // Caso normal 
    Alert.alert(
      'Cancelar?',
      rotaAtiva
        ? `Você está na rua ${ruaSelecionada}, passo ${currentIndex + 1} de ${enderecosRota.length}.\nDeseja sair da rota?`
        : 'Deseja sair do Modo Repetir?',
      [
        { text: 'Continuar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: resetParaTelaInicial },
      ]
    );
  };

  const resetParaTelaInicial = () => {
    setEnderecosRota([]);
    setCurrentIndex(0);
    setRuaSelecionada('');
    setEnderecoRepetir(null);
    limparFormulario();
  };

  // contagens recentes
  const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const contagensRecentes = new Set(
    listaContagens
      .filter((c) => {
        const ts = c.data_hora ?? c.criado_em ?? c.created_at ?? c.timestamp;
        return ts ? new Date(ts) >= duasHorasAtras : false;
      })
      .map((c) => String(c.endereco || c.rua))
  );

  // ─── renderização ────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header roxo */}
      <View style={styles.headerRoxo}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Contagem</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <HeaderContagem
          operadorLogado={operadorLogado}
          handleLogout={handleLogout}
          tituloSessao={sessaoTitulo}
        />

        <OfflineBanner
          quantidadeOffline={filaOffline.length}
          isRecontagem={isRecontagem}
          onSincronizar={sincronizarPendentes}
          salvando={salvando}
        />

        <StatusBanners
          isRecontagem={isRecontagem}
          preenchidoDoHistorico={preenchidoDoHistorico}
          foiContadoRecentemente={!!(enderecoAtual && contagensRecentes.has(enderecoAtual))}
        />

        {/* Lógica condicional para seleção de rua */}
        {!rotaAtiva && !enderecoRepetir && !isRecontagem ? (
          sessaoId ? (
            listaRuas.length === 0 ? (
              // Ainda carregando a lista de ruas
              <View style={styles.cardInicial}>
                <ActivityIndicator size="large" color="#4c1d95" />
                <Text style={{ marginTop: 12, color: '#64748b' }}>Carregando ruas...</Text>
              </View>
            ) : listaRuas.length > 1 ? (
              // Múltiplas ruas → botão "Selecionar Rua"
              <View style={styles.cardInicial}>
                <Ionicons name="map-outline" size={48} color="#4c1d95" />
                <Text style={styles.cardInicialTitulo}>Iniciar Contagem</Text>
                <TouchableOpacity
                  style={styles.botaoPrimario}
                  onPress={() => setModalRuasVisivel(true)}
                >
                  <Text style={styles.botaoPrimarioTexto}>SELECIONAR RUA</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Uma única rua → 
              <View style={styles.cardInicial}>
                <ActivityIndicator size="large" color="#4c1d95" />
                <Text style={{ marginTop: 12, color: '#64748b' }}>Iniciando contagem...</Text>
              </View>
            )
          ) : (
            <CardInicial onIniciarRota={() => router.push('/(tabs)/ciclos' as any)} />
          )
        ) : (
          // Rota ativa / repetição / recontagem → formulário de contagem
          <View style={styles.cardContagem}>
            <HeaderProgresso
              isRecontagem={isRecontagem}
              rotaAtiva={rotaAtiva}
              ruaSelecionada={ruaSelecionada}
              currentIndex={currentIndex}
              totalEnderecos={enderecosRota.length}
              progressoPct={progressoPct}
              onCancelarRota={confirmarCancelarRota}
            />

            <CardEnderecoAtual
              isRecontagem={isRecontagem}
              enderecoAtual={enderecoAtual}
              enderecoAtualObj={enderecoAtualObj}
            />

            {!isRecontagem && !enderecoAtualObj?.sku && (
              <CardProdutoInput
                isRecontagem={false}
                codigo={codigo}
                descricao={descricao}
                onAbrirModalProduto={() => setModalProdutoVisivel(true)}
                onAbrirCamera={undefined}
              />
            )}

            <FormContagem
              isRecontagem={isRecontagem}
              rotaAtiva={rotaAtiva}
              preenchidoDoHistorico={preenchidoDoHistorico}
              pallets={pallets}
              setPallets={setPallets}
              unidades={unidades}
              setUnidades={setUnidades}
              obs={obs}
              setObs={setObs}
              salvando={salvando}
              onSalvar={salvarContagem}
              onLimpar={limparFormulario}
              onPular={pularEndereco}
              palletsRef={palletsRef}
              unidadesRef={unidadesRef}
              obsRef={obsRef}
              placeholderPallets={placeholderPallets}
            />
          </View>
        )}
      </ScrollView>

      <ModalSelecionarRua
        visivel={modalRuasVisivel}
        ruas={listaRuas}
        carregando={carregandoRota}
        onClose={() => setModalRuasVisivel(false)}
        onSelecionarRua={iniciarRota}
      />
      <ModalSelecionarProduto
        visivel={modalProdutoVisivel}
        produtos={listaProdutos}
        onClose={() => setModalProdutoVisivel(false)}
        onSelecionarProduto={(produto: any) => {
          setCodigo(String(produto.codigo));
          setDescricao(produto.descricao);
          setModalProdutoVisivel(false);
          setTimeout(() => palletsRef.current?.focus(), 300);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerRoxo: {
    backgroundColor: '#4c1d95',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerBtn: { width: 44, alignItems: 'center' },
  headerTitulo: { fontSize: 18, fontWeight: '600', color: '#fff' },
  scrollContent: { padding: 16 },
  cardInicial: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
    elevation: 2,
  },
  cardInicialTitulo: { fontSize: 16, color: '#64748b', marginVertical: 16 },
  botaoPrimario: {
    backgroundColor: '#4c1d95',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 12,
  },
  botaoPrimarioTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  cardContagem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
});