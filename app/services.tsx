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
import { useSalonStore } from '../src/store/salonStore';
import { SalonService } from '../src/services/salonService';

export default function ServicesScreen() {
  const router = useRouter();
  const { currentSalon, services, setServices, setLoading } = useSalonStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentSalon) {
      loadServices();
    }
  }, [currentSalon]);

  const loadServices = async () => {
    if (!currentSalon) return;

    try {
      setLoading(true);
      const servicesData = await SalonService.getServicesBySalon(currentSalon.id);
      setServices(servicesData);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      Alert.alert('Erro', 'Falha ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const handleCreateService = () => {
    router.push('/services/create');
  };

  const handleEditService = (serviceId: string) => {
    router.push(`/services/${serviceId}/edit`);
  };

  const handleDeleteService = (serviceId: string) => {
    Alert.alert(
      'Excluir Serviço',
      'Tem certeza que deseja excluir este serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await SalonService.deleteService(serviceId);
              await loadServices();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir serviço');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  if (!currentSalon) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Nenhum salão selecionado</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Serviços</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateService}
        >
          <Text style={styles.createButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nenhum serviço</Text>
            <Text style={styles.emptyStateText}>
              Crie seu primeiro serviço para começar
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleCreateService}
            >
              <Text style={styles.emptyStateButtonText}>Criar Serviço</Text>
            </TouchableOpacity>
          </View>
        ) : (
          services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditService(service.id)}
                  >
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteService(service.id)}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.serviceCategory}>{service.category}</Text>
              
              <View style={styles.serviceDetails}>
                <Text style={styles.servicePrice}>
                  {formatPrice(service.price)}
                </Text>
                <Text style={styles.serviceDuration}>
                  {formatDuration(service.durationMin)}
                </Text>
              </View>
            </View>
          ))
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
  createButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: 24,
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
  emptyStateButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  actionButtonText: {
    color: '#495057',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  deleteButtonText: {
    color: '#721c24',
  },
  serviceCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
