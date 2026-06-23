import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { cores, GlobalStyles } from '../styles/GlobalStyles';
import { initOfflineDatabase, cacheRuas } from '../services/offlineStorage';

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

          router.replace('/');
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

      router.replace('/');
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

  if (loginAutomatico) {
    return (
      <View style={[GlobalStyles.container, styles.localContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={{ marginTop: 15, color: cores.textoMutado }}>Reconectando automaticamente...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[GlobalStyles.container, styles.localContainer]}
    >
      <View style={GlobalStyles.card}>
        <View style={[GlobalStyles.header, { marginBottom: 40 }]}>
          <View style={[GlobalStyles.iconContainerGeral, { backgroundColor: cores.iconeFundoAzul }]}>
            <Ionicons name="cube-outline" size={48} color={cores.primaria} />
          </View>
          <Text style={[GlobalStyles.titulo, { fontSize: 28 }]}>EstoquePro</Text>
          <Text style={[GlobalStyles.subtitulo, { fontSize: 15 }]}>Acesse sua conta para continuar</Text>
        </View>

        <View style={GlobalStyles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={cores.textoMutado} style={GlobalStyles.inputIcon} />
          <TextInput
            style={GlobalStyles.input}
            placeholder="Nome de usuário"
            placeholderTextColor={cores.desativado}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        <View style={GlobalStyles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={cores.textoMutado} style={GlobalStyles.inputIcon} />
          <TextInput
            style={[GlobalStyles.input, { flex: 1 }]}
            placeholder="Senha"
            placeholderTextColor={cores.desativado}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!mostrarSenha}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity
            style={{ paddingHorizontal: 10 }}
            onPress={() => setMostrarSenha(!mostrarSenha)}
          >
            <Ionicons
              name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={cores.textoMutado}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[GlobalStyles.btn, GlobalStyles.btnPrimario, carregando && GlobalStyles.btnDisabled]}
          onPress={handleLogin}
          disabled={carregando}
        >
          <Text style={GlobalStyles.btnTexto}>{carregando ? "CONECTANDO..." : "ENTRAR"}</Text>
        </TouchableOpacity>

        {temCredenciaisSalvas && (
          <TouchableOpacity
            style={[GlobalStyles.btn, { backgroundColor: cores.desativado, marginTop: 15 }]}
            onPress={handleSairDoPasseLivre}
          >
            <Text style={GlobalStyles.btnTexto}>🔓 SAIR DO PASSE LIVRE</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  localContainer: { justifyContent: 'center', padding: 20 }
});