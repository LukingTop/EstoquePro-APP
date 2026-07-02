import React, { useState } from 'react';
import {
  Modal, View, Text, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalSelecionarRuaProps {
  visivel: boolean;
  ruas: any[];
  carregando: boolean;
  onClose: () => void;
  onSelecionarRua: (ruaCodigo: string) => void;
}

function formatarCodigoRua(codigo: string): string {
  const semZeros = codigo.replace(/^0+/, '');
  return semZeros || '0';
}

export default function ModalSelecionarRua({
  visivel,
  ruas,
  carregando,
  onClose,
  onSelecionarRua,
}: ModalSelecionarRuaProps) {
  const [buscaRua, setBuscaRua] = useState('');

  const ruasFiltradas = ruas.filter(rua =>
    String(rua.codigo).includes(buscaRua)
  );

  const handleSelecionar = (ruaCodigo: string) => {
    onSelecionarRua(ruaCodigo);
    onClose();  
  };

  return (
    <Modal visible={visivel} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Selecionar Rua</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#475569" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Buscar número da rua..."
            value={buscaRua}
            onChangeText={setBuscaRua}
            keyboardType="numeric"
          />

          {carregando ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Baixando endereços...</Text>
            </View>
          ) : (
            <FlatList
              data={ruasFiltradas}
              keyExtractor={item => String(item.codigo)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelecionar(String(item.codigo))}
                >
                  <Ionicons name="location" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                  <Text style={styles.itemTexto}>{formatarCodigoRua(item.codigo)}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  loading: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 15,
  },
  item: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  itemTexto: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '500',
  },
});