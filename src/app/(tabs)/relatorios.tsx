import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

// ── Design  ─────────────────────────────
const COR_PRIMARIA = '#4c1d95';
const COR_FUNDO = '#F8FAFC';
const COR_CARD = '#FFFFFF';
const COR_BORDA = '#E2E8F0';
const COR_TEXTO_ESCURO = '#0F172A';
const COR_TEXTO_MEDIO = '#64748B';

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  route: string;
}

const menuItems: MenuItem[] = [
  {
    id: '1',
    icon: 'person-circle-outline',
    iconColor: COR_PRIMARIA,
    title: 'Meu Progresso',
    subtitle: 'Acompanhe sua produtividade e metas diárias',
    route: '/progresso',
  },
  {
    id: '2',
    icon: 'trophy-outline',
    iconColor: '#f59e0b',
    title: 'Ranking de Operadores',
    subtitle: 'Veja quem mais se destacou no turno',
    route: '/ranking',
  },
  {
    id: '3',
    icon: 'warning-outline',
    iconColor: '#B91C1C',
    title: 'Avarias',
    subtitle: 'Registre e consulte avarias de estoque',
    route: '/avaria',
  },
  {
    id: '4',
    icon: 'add-circle-outline',
    iconColor: '#15803D',
    title: 'Lançamento Livre',
    subtitle: 'Registre uma contagem em qualquer endereço',
    route: '/stage',
  },
];

export default function RelatoriosScreen() {
  return (
    <View style={styles.container}>
      {/* Header roxo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="menu-outline" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Relatórios</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.descricao}>
          Acesse relatórios detalhados, acompanhe seu desempenho e utilize ferramentas extras.
        </Text>

        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '18' }]}>
              <Ionicons name={item.icon} size={28} color={item.iconColor} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  header: {
    backgroundColor: COR_PRIMARIA,
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: {
    width: 40,
    alignItems: 'center',
  },
  headerTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  descricao: {
    fontSize: 15,
    color: COR_TEXTO_MEDIO,
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COR_CARD,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COR_BORDA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COR_TEXTO_ESCURO,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COR_TEXTO_MEDIO,
    lineHeight: 18,
  },
});