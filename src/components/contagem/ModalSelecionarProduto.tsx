import React, { useState } from 'react';
import {
  Modal, View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalSelecionarProdutoProps {
  visivel: boolean;
  produtos: any[];
  onClose: () => void;
  onSelecionarProduto: (produto: any) => void;
}

export default function ModalSelecionarProduto({
  visivel,
  produtos,
  onClose,
  onSelecionarProduto,
}: ModalSelecionarProdutoProps) {
  const [busca, setBusca] = useState('');

  const filtrados = produtos.filter(p =>
    String(p.codigo).includes(busca) ||
    p.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Modal visible={visivel} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Selecionar Produto</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#475569" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Buscar por código ou nome..."
            value={busca}
            onChangeText={setBusca}
          />
          <FlatList
            data={filtrados}
            keyExtractor={item => String(item.codigo)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => onSelecionarProduto(item)}
              >
                <Ionicons name="cube-outline" size={20} color="#16a34a" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTexto}>{item.codigo}</Text>
                  <Text style={styles.itemSubtexto}>{item.descricao}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
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
  itemSubtexto: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
});