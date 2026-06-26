import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GlobalStyles, cores } from '@/styles/GlobalStyles';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import api from '../services/api';
import { getEnderecosOffline, cacheEnderecos } from '../services/offlineStorage';

import * as Haptics from 'expo-haptics';

export default function ContagemScreen() {

  const params = useLocalSearchParams();
  const isRecontagem = params.is_recontagem === 'true';
  const tarefaId = params.tarefa_id;
  const enderecoTrava = params.endereco_trava as string;
  const produtoTrava = params.produto_trava as string;

  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pallets, setPallets] = useState('');
  const [obs, setObs] = useState('');
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [cameraVisivel, setCameraVisivel] = useState(false);
  const [escaneado, setEscaneado] = useState(false);
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
  const obsRef = useRef<TextInput>(null);

  const [enderecosRota, setEnderecosRota] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ruaSelecionada, setRuaSelecionada] = useState('');
  const [carregandoRota, setCarregandoRota] = useState(false);

  const rotaAtiva = enderecosRota.length > 0 && currentIndex < enderecosRota.length;
  const enderecoAtualObj = rotaAtiva ? enderecosRota[currentIndex] : null;

  const enderecoAtual: string | null = isRecontagem
    ? enderecoTrava
    : (enderecoAtualObj ? String(enderecoAtualObj.codigo) : enderecoRepetir);

  useEffect(() => {
    if (isRecontagem && produtoTrava) {
      setCodigo(produtoTrava);
      setPreenchidoDoHistorico(true);
      setTimeout(() => palletsRef.current?.focus(), 600);

      if (params.descricao_trava) {
        setDescricao(params.descricao_trava as string);
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
          setObs('');
          setPreenchidoDoHistorico(true);

          setTimeout(() => palletsRef.current?.focus(), 400);
        } catch {
        } finally {
          await SecureStore.deleteItemAsync('pendingRepeat');
        }
      };

      verificarPendingRepeat();
    }, [isRecontagem])
  );

  const obterFilaOffline = async () => {
    try {
      const dados = await SecureStore.getItemAsync('contagensOffline');
      return dados ? JSON.parse(dados) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const iniciarTela = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      const user = await SecureStore.getItemAsync('loggedUser');

      if (!token) {
        router.replace('/login');
        return;
      }

      if (user) {
        setOperadorLogado(user);
      }

      const fila = await obterFilaOffline();
      setFilaOffline(fila);

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const responseProdutos = await api.get('/produtos/', config);
        setListaProdutos(responseProdutos.data.results || responseProdutos.data);

        const responseRuas = await api.get('/ruas/', config);
        setListaRuas(responseRuas.data.results || responseRuas.data);

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
  }, []);

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
        }
      }
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

  const reproduzirFeedbackDeLeitura = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Erro ao reproduzir a vibração:', error);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const lerCodigoDeBarras = async ({ data }: { data: string }) => {
    if (escaneado) return;
    setEscaneado(true);

    await reproduzirFeedbackDeLeitura();

    handleCodigoChange(data);
    setCameraVisivel(false);
    setTimeout(() => { palletsRef.current?.focus(); }, 500);
  };

  const abrirModalRua = () => {
    setStepModalRota('RUA');
    setBuscaRua('');
    setModalRuasVisivel(true);
  };

  const fecharModalRua = () => {
    setModalRuasVisivel(false);
    setStepModalRota('RUA');
  };

  const iniciarRota = async (ruaCodigo: string) => {
    setCarregandoRota(true);
    try {
      let dados: any[] | null = null;

      try {
        dados = await getEnderecosOffline(ruaCodigo);
        if (dados && dados.length > 0) {
          console.log('Endereços carregados do cache offline.');
        }
      } catch (offlineError) {
        console.log('Cache offline indisponível, tentando API...');
      }

      if (!dados || dados.length === 0) {
        try {
          const token = await SecureStore.getItemAsync('userToken');
          const response = await api.get('/enderecos/', {
            headers: { Authorization: `Bearer ${token}` },
            params: { rua_codigo: ruaCodigo },
          });
          dados = response.data.results || response.data;
          await cacheEnderecos(ruaCodigo);
        } catch (apiError: any) {
          if (apiError.response?.status === 401) {
            Alert.alert('Sessão Expirada', 'Faça login novamente.');
            await SecureStore.deleteItemAsync('userToken');
            router.replace('/login');
          } else {
            Alert.alert('Erro', 'Não foi possível carregar os endereços desta rua.');
          }
          setCarregandoRota(false);
          return;
        }
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
    } catch (error) {
      console.error('Erro geral ao iniciar rota:', error);
    } finally {
      setCarregandoRota(false);
    }
  };

  const selecionarPontoPartida = (index: number) => {
    setCurrentIndex(index);
    fecharModalRua();
    limparFormularioProduto();
    cacheEnderecos(ruaSelecionada);
  };

  const avancarRota = () => {
    if (!rotaAtiva) {
      resetParaTelaInicial();
      return;
    }

    const proximo = currentIndex + 1;
    limparFormularioProduto();

    if (proximo >= enderecosRota.length) {
      const totalProcessado = enderecosRota.length;
      Alert.alert(
        '✅ Rota Concluída!',
        `Você finalizou a contagem da rua ${ruaSelecionada}.\n${totalProcessado} endereços processados.`,
        [{ text: 'OK', onPress: resetParaTelaInicial }]
      );
    } else {
      setCurrentIndex(proximo);
    }
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

  const resetParaTelaInicial = () => {
    setEnderecosRota([]);
    setCurrentIndex(0);
    setRuaSelecionada('');
    setEnderecoRepetir(null);
    limparFormularioProduto();
  };

  const confirmarCancelarRota = () => {
    if (isRecontagem) {
      Alert.alert('Cancelar Missão?', 'Deseja abandonar a recontagem e voltar para a lista de missões?', [
        { text: 'Não', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => router.replace('/missoes') }
      ]);
      return;
    }

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
      observacao: obs,
      id_local: Date.now().toString(),
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
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (patchError) {
          console.log('Aviso: Falha ao fechar a tarefa no backend.', patchError);
        }

        Alert.alert('✅ Missão Cumprida', 'Estoque ajustado e conflito resolvido!', [
          { text: 'OK', onPress: () => router.replace('/missoes') }
        ]);
        return;
      }

      setListaContagens(prev => [{ ...payload, data_hora: new Date().toISOString() }, ...prev]);
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

  const limparFormularioProduto = () => {
    setCodigo('');
    setDescricao('');
    setPallets('');
    setObs('');
    setEscaneado(false);
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
        await api.post(
          '/contagens/',
          {
            endereco: item.endereco,
            codigo_produto: item.codigo_produto,
            descricao_produto: item.descricao_produto,
            pallets: item.pallets,
            observacao: item.observacao,
            id_local: item.id_local,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  const obterTimestamp = (contagem: any): string | null =>
    contagem.data_hora ?? contagem.criado_em ?? contagem.created_at ?? contagem.timestamp ?? null;

  const ruasFiltradas = listaRuas.filter((rua) => String(rua.codigo).includes(buscaRua));
  const produtosFiltrados = listaProdutos.filter(
    (produto) =>
      String(produto.codigo).includes(buscaProduto) ||
      produto.descricao.toLowerCase().includes(buscaProduto.toLowerCase())
  );

  const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const contagensRecentes = new Set(
    listaContagens
      .filter((c) => {
        const ts = obterTimestamp(c);
        return ts ? new Date(ts) >= duasHorasAtras : false;
      })
      .map((c) => String(c.endereco || c.rua))
  );

  const progressoPct = enderecosRota.length > 0
    ? Math.round((currentIndex / enderecosRota.length) * 100)
    : 0;

  return (
    <KeyboardAwareScrollView
      style={styles.fundo}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={120}
    >
      <View style={styles.headerOperador}>
        <Ionicons name="person-circle" size={26} color="#475569" />
        <Text style={styles.textoOperador}>
          Operador: <Text style={styles.nomeOperador}>@{operadorLogado || '...'}</Text>
        </Text>
        <TouchableOpacity style={styles.btnSair} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {filaOffline.length > 0 && !isRecontagem && (
        <View style={styles.bannerOffline}>
          <View style={styles.bannerInfo}>
            <Ionicons name="cloud-offline" size={24} color="#92400e" />
            <Text style={styles.bannerTexto}>Você tem {filaOffline.length} contagens offline.</Text>
          </View>
          <TouchableOpacity style={styles.btnSincronizar} onPress={sincronizarPendentes} disabled={salvando}>
            {salvando ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnSincronizarTexto}>SINCRONIZAR</Text>}
          </TouchableOpacity>
        </View>
      )}

      {isRecontagem && (
        <View style={styles.bannerMissao}>
          <Ionicons name="shield-checkmark" size={24} color="#b91c1c" />
          <Text style={styles.bannerMissaoTexto}>
            MISSÃO DE RECONTAGEM ATIVA{'\n'}Endereço e Produto bloqueados.
          </Text>
        </View>
      )}

      {preenchidoDoHistorico && !isRecontagem && (
        <View style={styles.bannerHistorico}>
          <Ionicons name="time-outline" size={22} color="#1e40af" />
          <Text style={styles.bannerHistoricoTexto}>
            Produto pré-preenchido do histórico.{'\n'}Informe apenas a quantidade de pallets!
          </Text>
        </View>
      )}

      {enderecoAtual && contagensRecentes.has(enderecoAtual) && !isRecontagem && (
        <View style={styles.bannerRecente}>
          <Ionicons name="warning-outline" size={22} color="#d97706" />
          <Text style={styles.bannerRecenteTexto}>
            Este endereço já foi contado nas últimas 2 horas.
          </Text>
        </View>
      )}

      {(!rotaAtiva && !enderecoRepetir && !isRecontagem) ? (
        <View style={styles.cardInicial}>
          <View style={styles.iconeInicialWrapper}>
            <Ionicons name="navigate-circle-outline" size={56} color="#2563eb" />
          </View>
          <Text style={styles.tituloInicial}>Contagem Sequencial</Text>
          <Text style={styles.subtituloInicial}>
            Selecione uma rua e escolha o ponto de partida. O app te guiará na ordem correta.
          </Text>

          <TouchableOpacity style={styles.btnIniciarRota} onPress={abrirModalRua}>
            <Ionicons name="play-circle" size={22} color="#fff" />
            <Text style={styles.btnTexto}>INICIAR CONTAGEM</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.progressoHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressoRua}>
                {isRecontagem ? 'Resolução de Conflito' : (rotaAtiva ? `Rua ${ruaSelecionada}` : 'Repetir Contagem')}
              </Text>
              {rotaAtiva && !isRecontagem && (
                <Text style={styles.progressoTexto}>Passo {currentIndex + 1} de {enderecosRota.length}</Text>
              )}
            </View>
            <TouchableOpacity onPress={confirmarCancelarRota} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle-outline" size={28} color="#dc2626" />
            </TouchableOpacity>
          </View>

          {rotaAtiva && !isRecontagem && (
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressoPct}%` }]} />
            </View>
          )}

          <Text style={[styles.tituloSecao, { marginTop: (rotaAtiva || isRecontagem) ? 22 : 0, marginBottom: 18 }]}>
            Registrar Contagem
          </Text>

          <View style={styles.inputGrupo}>
            <Text style={styles.label}>
              <Ionicons name="location-outline" size={16} /> Endereço Atual
            </Text>
            <View style={[styles.enderecoTravado, isRecontagem && { borderColor: '#b91c1c', backgroundColor: '#fef2f2' }]}>
              <Ionicons name="lock-closed" size={18} color={isRecontagem ? '#b91c1c' : '#2563eb'} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.enderecoTravadoTexto, isRecontagem && { color: '#7f1d1d' }]}>{enderecoAtual}</Text>
                {enderecoAtualObj && (enderecoAtualObj.predio || enderecoAtualObj.posicao) && (
                  <Text style={styles.enderecoTravadoSub}>
                    Prédio {enderecoAtualObj.predio ?? '—'} · Posição {enderecoAtualObj.posicao ?? '—'}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.inputGrupo}>
            <Text style={styles.label}>
              <Ionicons name="barcode-outline" size={16} /> Produto
            </Text>

            {isRecontagem ? (
              <View style={[styles.enderecoTravado, { borderColor: '#b91c1c', backgroundColor: '#fef2f2' }]}>
                <Ionicons name="lock-closed" size={18} color="#b91c1c" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.enderecoTravadoTexto, { color: '#7f1d1d' }]}>{codigo}</Text>
                  <Text style={[styles.enderecoTravadoSub, { color: '#991b1b' }]}>{descricao || 'Carregando descrição...'}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.linhaInputBtn}>
                <TouchableOpacity
                  style={[styles.input, { flex: 1, marginBottom: 0, justifyContent: 'center' }]}
                  onPress={() => {
                    Keyboard.dismiss();                   
                    setModalProdutoVisivel(true);
                  }}
                >
                  <Text style={{ color: codigo ? '#1e293b' : '#94a3b8', fontSize: 16 }} numberOfLines={1}>
                    {codigo ? `${codigo} - ${descricao}` : 'Selecione ou busque o Produto'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnCamera} onPress={() => setCameraVisivel(true)}>
                  <Ionicons name="camera" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.inputGrupo}>
            <Text style={styles.label}>
              <Ionicons name="layers-outline" size={16} /> Pallets
            </Text>
            <TextInput
              ref={palletsRef}
              style={[styles.input, (preenchidoDoHistorico || isRecontagem) && styles.inputDestaque]}
              value={pallets}
              onChangeText={setPallets}
              keyboardType="numeric"
              placeholder={preenchidoDoHistorico ? '← Digite aqui!' : 'Ex: 40'}
              placeholderTextColor={preenchidoDoHistorico ? '#2563eb' : '#94a3b8'}
              returnKeyType="next"
              onSubmitEditing={() => obsRef.current?.focus()}
            />
          </View>

          <View style={styles.inputGrupo}>
            <Text style={styles.label}>
              <Ionicons name="chatbox-ellipses-outline" size={16} /> Observação
            </Text>
            <TextInput
              ref={obsRef}
              style={styles.input}
              value={obs}
              onChangeText={setObs}
              placeholder="Opcional..."
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.btnPrincipal,
              salvando && { opacity: 0.7 },
              isRecontagem && { backgroundColor: '#b91c1c' }
            ]}
            onPress={salvarContagem}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name={isRecontagem ? "checkmark-done-circle" : "arrow-forward-circle-outline"} size={20} color="#fff" />
                <Text style={styles.btnTexto}>
                  {isRecontagem ? "FINALIZAR MISSÃO" : (rotaAtiva ? "SALVAR E AVANÇAR" : "SALVAR E FECHAR")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {rotaAtiva && !isRecontagem && (
            <TouchableOpacity style={styles.btnPular} onPress={pularEndereco} disabled={salvando}>
              <Ionicons name="play-skip-forward-outline" size={18} color="#64748b" />
              <Text style={styles.btnPularTexto}>Pular Endereço</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {(!rotaAtiva && !enderecoRepetir && !isRecontagem) && (
        <View style={{ marginTop: 20, gap: 12 }}>
          <TouchableOpacity style={styles.btnSecundario} onPress={() => router.push('/lista')} disabled={salvando}>
            <Ionicons name="list" size={20} color="#2563eb" />
            <Text style={styles.btnTextoSecundario}>VER HISTÓRICO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecundario, { borderColor: '#b91c1c', marginTop: 0 }]}
            onPress={() => router.push('/missoes')}
            disabled={salvando}
          >
            <Ionicons name="shield-checkmark" size={20} color="#b91c1c" />
            <Text style={[styles.btnTextoSecundario, { color: '#b91c1c' }]}>MISSÕES DE RECONTAGEM</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecundario, { borderColor: cores.textoMutado, marginTop: 0 }]}
            onPress={() => router.push('/stage')}
            disabled={salvando}
          >
            <Ionicons name="cube-outline" size={20} color={cores.textoMutado} />
            <Text style={[styles.btnTextoSecundario, { color: cores.textoMutado }]}>
              📦 LANÇAMENTO LIVRE (STAGE)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecundario, { borderColor: cores.primaria, marginTop: 0 }]}
            onPress={() => router.push('/dashboard')}
            disabled={salvando}
          >
            <Ionicons name="stats-chart-outline" size={20} color={cores.primaria} />
            <Text style={[styles.btnTextoSecundario, { color: cores.primaria }]}>
              📊 MEU PROGRESSO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecundario, { borderColor: '#f59e0b', marginTop: 0 }]}
            onPress={() => router.push('/ranking')}
            disabled={salvando}
          >
            <Ionicons name="trophy-outline" size={20} color="#f59e0b" />
            <Text style={[styles.btnTextoSecundario, { color: '#f59e0b' }]}>
              🏆 RANKING
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={cameraVisivel} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} onBarcodeScanned={escaneado ? undefined : lerCodigoDeBarras} />
          <TouchableOpacity style={styles.btnFecharCamera} onPress={() => setCameraVisivel(false)}>
            <Text style={styles.btnTexto}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      
      <Modal visible={modalRuasVisivel} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {stepModalRota === 'ENDERECO' && (
                <TouchableOpacity onPress={() => setStepModalRota('RUA')} style={{ marginRight: 15 }}>
                  <Ionicons name="arrow-back" size={24} color="#475569" />
                </TouchableOpacity>
              )}
              <Text style={styles.tituloSecao}>
                {stepModalRota === 'RUA' ? 'Selecionar Rua' : 'Ponto de Partida'}
              </Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={fecharModalRua} disabled={carregandoRota}>
                <Ionicons name="close" size={28} color="#475569" />
              </TouchableOpacity>
            </View>

            {stepModalRota === 'RUA' ? (
              <>
                <TextInput
                  style={[styles.input, { marginBottom: 15 }]}
                  placeholder="Buscar número da rua..."
                  value={buscaRua}
                  onChangeText={setBuscaRua}
                  keyboardType="numeric"
                  editable={!carregandoRota}
                />
                {carregandoRota ? (
                  <View style={styles.loadingRota}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.loadingRotaTexto}>Baixando endereços da rota...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={ruasFiltradas}
                    keyExtractor={(item) => String(item.codigo)}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.itemLista} onPress={() => iniciarRota(String(item.codigo))}>
                        <Ionicons name="location" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={styles.itemTexto}>{item.codigo}</Text>
                        <View style={{ flex: 1 }} />
                        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.textoVazio}>Nenhuma rua encontrada.</Text>}
                  />
                )}
              </>
            ) : (
              <>
                <Text style={{ color: '#64748b', marginBottom: 15, textAlign: 'center' }}>
                  Abaixo estão os endereços da rua {ruaSelecionada}. Clique em um deles para iniciar a contagem a partir dele.
                </Text>
                <FlatList
                  data={enderecosRota}
                  keyExtractor={(item) => String(item.codigo)}
                  renderItem={({ item, index }) => {
                    const temDuplicata = contagensRecentes.has(String(item.codigo));
                    return (
                      <TouchableOpacity
                        style={[styles.itemLista, temDuplicata && styles.itemListaAviso]}
                        onPress={() => selecionarPontoPartida(index)}
                      >
                        <Ionicons
                          name={temDuplicata ? 'warning' : 'flag'}
                          size={20}
                          color={temDuplicata ? '#d97706' : '#64748b'}
                          style={{ marginRight: 10 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemTexto}>{item.codigo}</Text>
                          {temDuplicata && <Text style={styles.itemAvisoTexto}>⚠ Já contado nas últimas 2h</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>

      
      <Modal visible={modalProdutoVisivel} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.tituloSecao}>Selecionar Produto</Text>
              <TouchableOpacity onPress={() => setModalProdutoVisivel(false)}>
                <Ionicons name="close" size={28} color="#475569" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { marginBottom: 15 }]}
              placeholder="Buscar por código ou nome..."
              value={buscaProduto}
              onChangeText={setBuscaProduto}
            />
            <FlatList
              data={produtosFiltrados}
              keyExtractor={(item) => String(item.codigo)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemLista}
                  onPress={() => {
                    setCodigo(String(item.codigo));
                    setDescricao(item.descricao);
                    setModalProdutoVisivel(false);
                    setBuscaProduto('');
                    setTimeout(() => palletsRef.current?.focus(), 300);
                  }}
                >
                  <Ionicons name="cube-outline" size={20} color="#16a34a" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTexto}>{item.codigo}</Text>
                    <Text style={styles.itemSubtexto}>{item.descricao}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.textoVazio}>Nenhum produto encontrado.</Text>}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: '#f1f5f9' },
  container: { padding: 15, paddingBottom: 40 },

  headerOperador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textoOperador: {
    fontSize: 15,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  nomeOperador: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  btnSair: {
    padding: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },

  bannerOffline: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#d97706',
    elevation: 2,
  },
  bannerMissao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#b91c1c',
    gap: 10,
    elevation: 2,
  },
  bannerMissaoTexto: {
    color: '#991b1b',
    fontWeight: '600',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bannerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  bannerTexto: { color: '#92400e', fontWeight: '600', marginLeft: 10, flex: 1, fontSize: 15 },
  btnSincronizar: { backgroundColor: '#d97706', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSincronizarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  bannerHistorico: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#2563eb',
    gap: 10,
    elevation: 2,
  },
  bannerHistoricoTexto: {
    color: '#1e40af',
    fontWeight: '600',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  bannerRecente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#d97706',
    gap: 10,
    elevation: 2,
  },
  bannerRecenteTexto: {
    color: '#92400e',
    fontWeight: '600',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  inputDestaque: {
    borderColor: '#2563eb',
    borderWidth: 2,
    backgroundColor: '#eff6ff',
  },

  cardInicial: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    elevation: 4,
  },
  iconeInicialWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tituloInicial: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 10, textAlign: 'center' },
  subtituloInicial: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  btnIniciarRota: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    elevation: 2,
  },

  progressoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  progressoRua: { fontSize: 17, fontWeight: 'bold', color: '#1e293b' },
  progressoTexto: { fontSize: 13, color: '#64748b', marginTop: 2 },
  progressBarBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 4 },

  enderecoTravado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  enderecoTravadoTexto: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  enderecoTravadoSub: { fontSize: 12, color: '#64748b', marginTop: 2 },

  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 4 },
  tituloSecao: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' },
  inputGrupo: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 5 },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#fff',
    height: 50,
  },
  linhaInputBtn: { flexDirection: 'row', alignItems: 'center' },
  btnCamera: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
    height: 50,
    justifyContent: 'center',
  },
  btnPrincipal: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    padding: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  btnPular: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  btnPularTexto: { color: '#64748b', fontWeight: '600', fontSize: 14 },

  btnSecundario: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#2563eb',
    gap: 10,
  },
  btnTextoSecundario: { color: '#2563eb', fontWeight: 'bold', fontSize: 14 },

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  btnFecharCamera: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#dc2626',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  itemLista: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  itemTexto: { fontSize: 18, color: '#1e293b', fontWeight: '500' },
  itemSubtexto: { fontSize: 14, color: '#64748b', marginTop: 2 },
  textoVazio: { textAlign: 'center', color: '#94a3b8', marginTop: 20, fontSize: 16 },

  itemListaAviso: {
    backgroundColor: '#fffbeb',
  },
  itemAvisoTexto: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '600',
    marginTop: 2,
  },
  loadingRota: { paddingVertical: 50, alignItems: 'center', gap: 14 },
  loadingRotaTexto: { color: '#64748b', fontSize: 15 },
});