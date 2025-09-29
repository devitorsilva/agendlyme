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

export default function StaffScreen() {
  const router = useRouter();
  const { currentSalon, staff, setStaff, setLoading } = useSalonStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentSalon) {
      loadStaff();
    }
  }, [currentSalon]);

  const loadStaff = async () => {
    if (!currentSalon) return;

    try {
      setLoading(true);
      const staffData = await SalonService.getStaffBySalon(currentSalon.id);
      setStaff(staffData);
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
      Alert.alert('Erro', 'Falha ao carregar equipe');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStaff();
    setRefreshing(false);
  };

  const handleCreateStaff = () => {
    router.push('/staff/create');
  };

  const handleEditStaff = (staffId: string) => {
    router.push(`/staff/${staffId}/edit`);
  };

  const handleDeleteStaff = (staffId: string) => {
    Alert.alert(
      'Excluir Membro da Equipe',
      'Tem certeza que deseja excluir este membro da equipe?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await SalonService.deleteStaff(staffId);
              await loadStaff();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir membro da equipe');
            }
          },
        },
      ]
    );
  };

  const formatWorkHours = (workHours: any[]) => {
    if (!workHours || workHours.length === 0) {
      return 'Não definido';
    }

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return workHours
      .map((wh) => `${days[wh.dayOfWeek]}: ${wh.start}-${wh.end}`)
      .join(', ');
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
        <Text style={styles.title}>Equipe</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateStaff}
        >
          <Text style={styles.createButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {staff.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nenhum membro da equipe</Text>
            <Text style={styles.emptyStateText}>
              Adicione membros à sua equipe para começar
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleCreateStaff}
            >
              <Text style={styles.emptyStateButtonText}>Adicionar Membro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          staff.map((member) => (
            <View key={member.id} style={styles.staffCard}>
              <View style={styles.staffHeader}>
                <Text style={styles.staffName}>ID: {member.userId}</Text>
                <View style={styles.staffActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditStaff(member.id)}
                  >
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteStaff(member.id)}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.staffDetails}>
                <Text style={styles.staffDetail}>
                  Serviços oferecidos: {member.servicesOffered.length}
                </Text>
                <Text style={styles.staffDetail}>
                  Calendário conectado: {member.calendarLinked ? 'Sim' : 'Não'}
                </Text>
                <Text style={styles.staffDetail}>
                  Horários: {formatWorkHours(member.workHours)}
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
  staffCard: {
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
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  staffActions: {
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
  staffDetails: {
    gap: 4,
  },
  staffDetail: {
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
