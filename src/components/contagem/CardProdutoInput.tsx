import React from 'react';
import { View, Text, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CardProdutoInputProps {
  isRecontagem: boolean;
  codigo: string;
  descricao: string;
  onAbrirModalProduto: () => void;
  onAbrirCamera?: () => void;   
}

export default function CardProdutoInput({
  isRecontagem,
  codigo,
  descricao,
  onAbrirModalProduto,
  onAbrirCamera,
}: CardProdutoInputProps) {
  return (
    <View style={styles.inputGrupo}>
      <Text style={styles.label}>
        <Ionicons name="barcode-outline" size={16} /> Produto
      </Text>

      {isRecontagem ? (
        <View style={[styles.enderecoTravado, { borderColor: '#b91c1c', backgroundColor: '#fef2f2' }]}>
          <Ionicons name="lock-closed" size={18} color="#b91c1c" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.enderecoTravadoTexto, { color: '#7f1d1d' }]}>{codigo}</Text>
            <Text style={[styles.enderecoTravadoSub, { color: '#991b1b' }]}>
              {descricao || 'Carregando descrição...'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.linhaInputBtn}>
          <TouchableOpacity
            style={[styles.input, { flex: 1, marginBottom: 0, justifyContent: 'center' }]}
            onPress={() => {
              Keyboard.dismiss();
              onAbrirModalProduto();
            }}
          >
            <Text style={{ color: codigo ? '#1e293b' : '#94a3b8', fontSize: 16 }} numberOfLines={1}>
              {codigo ? `${codigo} - ${descricao}` : 'Selecione ou busque o Produto'}
            </Text>
          </TouchableOpacity>
          {onAbrirCamera && (
            <TouchableOpacity style={styles.btnCamera} onPress={onAbrirCamera}>
              <Ionicons name="camera" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGrupo: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 6, textTransform: 'uppercase' },
  enderecoTravado: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14 },
  enderecoTravadoTexto: { fontSize: 18, fontWeight: 'bold' },
  enderecoTravadoSub: { fontSize: 13, marginTop: 2 },
  linhaInputBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  btnCamera: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});