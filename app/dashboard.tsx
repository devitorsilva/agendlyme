import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { useSalonStore } from '../src/store/salonStore';
import { SalonService } from '../src/services/salonService';
import { AuthService } from '../src/services/authService';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { currentSalon, setCurrentSalon } = useSalonStore();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSalons();
    }
  }, [user]);

  const loadUserSalons = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const salons = await SalonService.getSalonsByOwner(user.id);
      if (salons.length > 0) {
        setCurrentSalon(salons[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar salões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserSalons();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await AuthService.signOut();
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleCreateSalon = () => {
    router.push('/salon/create');
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Olá, {user.name}!</Text>

        {currentSalon ? (
          <View style={styles.salonCard}>
            <Text style={styles.salonName}>{currentSalon.name}</Text>
            <Text style={styles.salonAddress}>{currentSalon.address}</Text>
            
            <View style={styles.menuGrid}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/appointments')}
              >
                <Text style={styles.menuItemText}>Agendamentos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/services')}
              >
                <Text style={styles.menuItemText}>Serviços</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/staff')}
              >
                <Text style={styles.menuItemText}>Equipe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/salon/settings')}
              >
                <Text style={styles.menuItemText}>Configurações</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nenhum salão encontrado</Text>
            <Text style={styles.emptyStateText}>
              Crie seu primeiro salão para começar a gerenciar agendamentos
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateSalon}
            >
              <Text style={styles.createButtonText}>Criar Salão</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  salonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salonName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  salonAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#3498db',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
