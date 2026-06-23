  import { StyleSheet } from 'react-native';

  export const cores = {
  primaria: '#2563eb',
  sucesso: '#16a34a',
  fundo: '#f1f5f9',
  cartao: '#ffffff',
  texto: '#1e293b',
  textoMutado: '#64748b',
  borda: '#e2e8f0',
  cinzaClaro: '#f8fafc',
  desativado: '#94a3b8',
  iconeFundoAzul: '#eff6ff',
  iconeFundoVerde: '#dcfce7',
  statusOk: '#16a34a',            
  statusDivergente: '#b91c1c',    
  statusVazio: '#cbd5e1',         
  statusOkFundo: '#dcfce7',       
  statusDivergenteFundo: '#fef2f2', 
  statusVazioFundo: '#f1f5f9',    
  };

  export const GlobalStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cores.fundo,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    card: {
      backgroundColor: cores.cartao,
      padding: 30,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 5,
    },
    header: {
      alignItems: 'center',
      marginBottom: 35,
    },
    iconContainerGeral: {
      padding: 15,
      borderRadius: 20,
      marginBottom: 15,
    },
    titulo: {
      fontSize: 26,
      fontWeight: 'bold',
      color: cores.texto,
      marginBottom: 5,
    },
    subtitulo: {
      fontSize: 14,
      color: cores.textoMutado,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: cores.cinzaClaro,
      borderWidth: 1,
      borderColor: cores.borda,
      borderRadius: 12,
      marginBottom: 15,
      paddingHorizontal: 15,
      height: 55,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      color: cores.texto,
      fontSize: 16,
    },
    btn: {
      height: 55,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      elevation: 4,
    },
    btnPrimario: {
      backgroundColor: cores.primaria,
      shadowColor: cores.primaria,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    btnSucesso: {
      backgroundColor: cores.sucesso,
      shadowColor: cores.sucesso,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    btnDisabled: {
      backgroundColor: cores.desativado,
      shadowOpacity: 0,
      elevation: 0,
    },
    btnTexto: {
      color: cores.cartao,
      fontWeight: 'bold',
      fontSize: 16,
      letterSpacing: 0.5,
    }
    
  });

  