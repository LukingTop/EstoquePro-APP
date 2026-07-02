import React, { forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormContagemProps {
  isRecontagem: boolean;
  rotaAtiva: boolean;
  preenchidoDoHistorico: boolean;
  pallets: string;
  setPallets: (text: string) => void;
  unidades: string;
  setUnidades: (text: string) => void;
  obs: string;
  setObs: (text: string) => void;
  salvando: boolean;
  onSalvar: () => void;
  onLimpar?: () => void;
  onPular?: () => void;
  palletsRef?: any;
  unidadesRef?: any;
  obsRef?: any;
  placeholderPallets?: string;
}

const COR_PRIMARIA = '#4c1d95';
const COR_BORDA = '#E2E8F0';

const FormContagem = forwardRef<TextInput, FormContagemProps>(({
  isRecontagem,
  rotaAtiva,
  preenchidoDoHistorico,
  pallets,
  setPallets,
  unidades,
  setUnidades,
  obs,
  setObs,
  salvando,
  onSalvar,
  onLimpar,
  onPular,
  palletsRef,
  unidadesRef,
  obsRef,
  placeholderPallets,
}, ref) => {
  const highlight = preenchidoDoHistorico || !!placeholderPallets;
  const placeholderText = placeholderPallets || '0';
  const placeholderColor = highlight ? COR_PRIMARIA : '#94a3b8';

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Qtd Paletes</Text>
          <TextInput
            ref={palletsRef || ref}
            style={[styles.input, highlight && styles.inputDestaque]}
            value={pallets}
            onChangeText={setPallets}
            keyboardType="numeric"
            placeholder={placeholderText}
            placeholderTextColor={placeholderColor}
            returnKeyType="next"
            onSubmitEditing={() => unidadesRef?.current?.focus()}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Qtd Unidades</Text>
          <TextInput
            ref={unidadesRef}
            style={styles.input}
            value={unidades}
            onChangeText={setUnidades}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
            returnKeyType="next"
            onSubmitEditing={() => obsRef?.current?.focus()}
          />
        </View>
      </View>

      <View style={styles.inputGrupo}>
        <Text style={styles.label}>Observação</Text>
        <TextInput
          ref={obsRef}
          style={[styles.input, styles.textArea]}
          value={obs}
          onChangeText={setObs}
          placeholder="Adicione uma observação..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={3}
          maxLength={300}
          returnKeyType="done"
        />
        <Text style={styles.charCount}>{obs.length}/300</Text>
      </View>

      <View style={styles.botoesRow}>
        {onLimpar && (
          <TouchableOpacity style={styles.btnLimpar} onPress={onLimpar} disabled={salvando}>
            <Ionicons name="trash-outline" size={18} color={COR_PRIMARIA} />
            <Text style={styles.btnLimparTexto}>LIMPAR</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.btnConfirmar, salvando && { opacity: 0.7 }, isRecontagem && { backgroundColor: '#b91c1c' }]}
          onPress={onSalvar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.btnConfirmarTexto}>CONFIRMAR CONTAGEM</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {rotaAtiva && !isRecontagem && onPular && (
        <TouchableOpacity style={styles.btnPular} onPress={onPular} disabled={salvando}>
          <Ionicons name="play-skip-forward-outline" size={18} color="#64748b" />
          <Text style={styles.btnPularTexto}>Pular Endereço</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

export default FormContagem;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  col: { flex: 1 },
  inputGrupo: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  inputDestaque: {
    borderColor: COR_PRIMARIA,
    borderWidth: 2,
    backgroundColor: '#ede9fe',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  botoesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  btnLimpar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COR_PRIMARIA,
    paddingVertical: 12,
    gap: 8,
  },
  btnLimparTexto: {
    color: COR_PRIMARIA,
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnConfirmar: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COR_PRIMARIA,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    elevation: 4,
    shadowColor: COR_PRIMARIA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnConfirmarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnPular: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 10,
    gap: 6,
  },
  btnPularTexto: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
});