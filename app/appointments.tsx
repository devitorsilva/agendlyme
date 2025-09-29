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
import { useAppointmentStore } from '../src/store/appointmentStore';
import { useSalonStore } from '../src/store/salonStore';
import { AppointmentService } from '../src/services/appointmentService';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentSalon } = useSalonStore();
  const { appointments, setAppointments, setLoading } = useAppointmentStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentSalon) {
      loadAppointments();
    }
  }, [currentSalon]);

  const loadAppointments = async () => {
    if (!currentSalon) return;

    try {
      setLoading(true);
      const appointmentsData = await AppointmentService.getAppointmentsBySalon(currentSalon.id);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      Alert.alert('Erro', 'Falha ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const handleCreateAppointment = () => {
    router.push('/appointments/create');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'confirmed':
        return '#27ae60';
      case 'done':
        return '#3498db';
      case 'no_show':
        return '#e74c3c';
      case 'canceled':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'done':
        return 'Concluído';
      case 'no_show':
        return 'Não compareceu';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
        <Text style={styles.title}>Agendamentos</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateAppointment}
        >
          <Text style={styles.createButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nenhum agendamento</Text>
            <Text style={styles.emptyStateText}>
              Crie seu primeiro agendamento para começar
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleCreateAppointment}
            >
              <Text style={styles.emptyStateButtonText}>Criar Agendamento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentDate}>
                  {formatDate(new Date(appointment.start))}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(appointment.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(appointment.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.appointmentTime}>
                {formatTime(new Date(appointment.start))} - {formatTime(new Date(appointment.end))}
              </Text>

              <Text style={styles.appointmentClient}>
                Cliente: {appointment.clientId}
              </Text>

              {appointment.notes && (
                <Text style={styles.appointmentNotes}>
                  Observações: {appointment.notes}
                </Text>
              )}

              <View style={styles.appointmentActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/appointments/${appointment.id}`)}
                >
                  <Text style={styles.actionButtonText}>Ver detalhes</Text>
                </TouchableOpacity>
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
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appointmentClient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appointmentNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  actionButtonText: {
    color: '#495057',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
