// app/login.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image, 
} from 'react-native';
import api from '../services/api';
import { initOfflineDatabase, cacheRuas } from '../services/offlineStorage';

// Design 
const COR_PRIMARIA = '#4c1d95';
const COR_FUNDO = '#F8FAFC';
const COR_CARD = '#FFFFFF';
const COR_BORDA = '#E2E8F0';
const COR_TEXTO_ESCURO = '#0F172A';
const COR_TEXTO_MEDIO = '#64748B';
const COR_VERMELHO = '#B91C1C';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loginAutomatico, setLoginAutomatico] = useState(false);
  const [temCredenciaisSalvas, setTemCredenciaisSalvas] = useState(false);

  useEffect(() => {
    const tentarLoginAutomatico = async () => {
      const savedUsername = await SecureStore.getItemAsync('savedUsername');
      const savedPassword = await SecureStore.getItemAsync('savedPassword');

      if (savedUsername && savedPassword) {
        setLoginAutomatico(true);
        setTemCredenciaisSalvas(true);
        try {
          const response = await api.post('/token/', {
            username: savedUsername,
            password: savedPassword,
          }, { timeout: 7000 });

          await SecureStore.setItemAsync('userToken', response.data.access);
          await SecureStore.setItemAsync('refreshToken', response.data.refresh);
          await SecureStore.setItemAsync('loggedUser', savedUsername);

          await baixarDicionarioProdutos();
          await inicializarCacheOffline();

          router.replace('/(tabs)/inicio');
        } catch (error: any) {
          await SecureStore.deleteItemAsync('savedUsername');
          await SecureStore.deleteItemAsync('savedPassword');
          setTemCredenciaisSalvas(false);
        } finally {
          setLoginAutomatico(false);
        }
      }
    };

    tentarLoginAutomatico();
  }, []);

  const baixarDicionarioProdutos = async () => {
    try {
      const response = await api.get('/produtos/');
      const produtos = response.data.results || response.data;
      const dicionario = produtos.map((p: any) => ({
        codigo: String(p.codigo),
        descricao: p.descricao,
      }));
      await AsyncStorage.setItem('dicionarioProdutos', JSON.stringify(dicionario));
    } catch (error) {
     
    }
  };

  const inicializarCacheOffline = async () => {
    try {
      initOfflineDatabase();
      await cacheRuas();
    } catch (error) {
      
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Atenção", "Preencha usuário e senha.");
      return;
    }

    setCarregando(true);
    try {
      const response = await api.post('/token/', { username, password }, { timeout: 7000 });

      await SecureStore.setItemAsync('userToken', response.data.access);
      await SecureStore.setItemAsync('refreshToken', response.data.refresh);
      await SecureStore.setItemAsync('loggedUser', username);
      await SecureStore.setItemAsync('savedUsername', username);
      await SecureStore.setItemAsync('savedPassword', password);

      await baixarDicionarioProdutos();
      await inicializarCacheOffline();

      const pushToken = await SecureStore.getItemAsync('pushToken');
      if (pushToken) {
        try {
          await api.post('/operador/atualizar-token/', { token: pushToken });
          await SecureStore.deleteItemAsync('pushToken');
        } catch (e) {
         
        }
      }

      router.replace('/(tabs)/inicio');
    } catch (error: any) {
      if (error.code === 'ECONNABORTED' || !error.response) {
        Alert.alert(
          "Servidor Inacessível ⚠️",
          "O servidor demorou muito para responder ou está desligado. Verifique se o Django está rodando (runserver) e se o IP está correto."
        );
      } else {
        Alert.alert("Erro", "Usuário ou senha inválidos.");
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleSairDoPasseLivre = async () => {
    await SecureStore.deleteItemAsync('savedUsername');
    await SecureStore.deleteItemAsync('savedPassword');
    setTemCredenciaisSalvas(false);
    setUsername('');
    setPassword('');
  };

  // Tela de loading durante tentativa de login automático
  if (loginAutomatico) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COR_PRIMARIA} />
        <Text style={styles.loadingText}>Reconectando automaticamente...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
       
        <View style={styles.logoContainer}>
          
          <View style={styles.ilustracao}>
            <Ionicons name="cube-outline" size={64} color={COR_PRIMARIA} />
            <Ionicons name="checkmark-circle" size={32} color="#15803D" style={styles.checkIcon} />
          </View>
          <Text style={styles.appName}>Cargo Polo</Text>
          <Text style={styles.subtitle}>Inventário Rotativo de Estoque</Text>
        </View>

        {/* ── Campos de login ────────────────────────── */}
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COR_TEXTO_MEDIO} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Usuário (e-mail)"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COR_TEXTO_MEDIO} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!mostrarSenha}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            >
              <Ionicons
                name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COR_TEXTO_MEDIO}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Botão Entrar ────────────────────────────── */}
        <TouchableOpacity
          style={[styles.button, carregando && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={carregando}
          activeOpacity={0.8}
        >
          {carregando ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>

        {/* ── Checkbox "Lembrar meu acesso" ──────────────  */}
        <View style={styles.rememberRow}>
          <Ionicons name="checkmark-circle" size={18} color={COR_PRIMARIA} />
          <Text style={styles.rememberText}>Lembrar meu acesso</Text>
        </View>

        {/* ── Botão de sair do passe livre ────────────── */}
        {temCredenciaisSalvas && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSairDoPasseLivre}
          >
            <Ionicons name="log-out-outline" size={16} color={COR_VERMELHO} />
            <Text style={styles.logoutText}>🔓 SAIR DO PASSE LIVRE</Text>
          </TouchableOpacity>
        )}

        {/* ── Versão do app ────────────────────────────── */}
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
    justifyContent: 'center',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COR_FUNDO,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COR_TEXTO_MEDIO,
  },
  card: {
    backgroundColor: COR_CARD,
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: COR_BORDA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  ilustracao: {
    position: 'relative',
    marginBottom: 16,
  },
  checkIcon: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COR_PRIMARIA,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: COR_TEXTO_MEDIO,
    marginTop: 4,
  },
  inputGroup: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COR_FUNDO,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COR_BORDA,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COR_TEXTO_ESCURO,
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    backgroundColor: COR_PRIMARIA,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COR_PRIMARIA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  rememberText: {
    fontSize: 14,
    color: COR_TEXTO_MEDIO,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    height: 44,
    marginBottom: 24,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    color: COR_VERMELHO,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
  },
});