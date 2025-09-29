import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSalonStore } from '../../src/store/salonStore';
import { useAppointmentStore } from '../../src/store/appointmentStore';
import { useAuthStore } from '../../src/store/authStore';
import { AppointmentService } from '../../src/services/appointmentService';
import { SalonService } from '../../src/services/salonService';

const appointmentSchema = z.object({
  staffId: z.string().min(1, 'Profissional é obrigatório'),
  serviceId: z.string().min(1, 'Serviço é obrigatório'),
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentSalon, services, staff, setServices, setStaff } = useSalonStore();
  const { addAppointment } = useAppointmentStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  useEffect(() => {
    if (currentSalon) {
      loadSalonData();
    }
  }, [currentSalon]);

  const loadSalonData = async () => {
    if (!currentSalon) return;

    try {
      const [servicesData, staffData] = await Promise.all([
        SalonService.getServicesBySalon(currentSalon.id),
        SalonService.getStaffBySalon(currentSalon.id),
      ]);
      
      setServices(servicesData);
      setStaff(staffData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    if (!currentSalon || !user) {
      Alert.alert('Erro', 'Dados insuficientes para criar agendamento');
      return;
    }

    try {
      setIsLoading(true);
      
      // Encontrar o serviço selecionado para obter a duração
      const selectedService = services.find(s => s.id === data.serviceId);
      if (!selectedService) {
        Alert.alert('Erro', 'Serviço não encontrado');
        return;
      }

      // Criar objeto Date para início
      const [year, month, day] = data.date.split('-').map(Number);
      const [hours, minutes] = data.time.split(':').map(Number);
      const startDate = new Date(year, month - 1, day, hours, minutes);
      
      // Calcular data de fim baseada na duração do serviço
      const endDate = new Date(startDate.getTime() + selectedService.durationMin * 60000);
      
      const appointmentData = {
        salonId: currentSalon.id,
        staffId: data.staffId,
        serviceId: data.serviceId,
        clientId: data.clientId,
        start: startDate,
        end: endDate,
        status: 'pending' as const,
        notes: data.notes,
        source: 'app' as const,
        createdBy: user.id,
      };

      const appointmentId = await AppointmentService.createAppointment(appointmentData);
      
      const newAppointment = {
        id: appointmentId,
        ...appointmentData,
        createdAt: new Date(),
      };
      
      addAppointment(newAppointment);
      
      Alert.alert('Sucesso', 'Agendamento criado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      if (error instanceof Error && error.message.includes('Conflito de horário')) {
        Alert.alert('Erro', 'Já existe um agendamento neste horário para este profissional');
      } else {
        Alert.alert('Erro', 'Falha ao criar agendamento');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentSalon) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nenhum salão selecionado</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Criar Agendamento</Text>
          <Text style={styles.subtitle}>Preencha os dados do agendamento</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="clientId"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.clientId && styles.inputError]}
                  placeholder="ID do Cliente"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.clientId && <Text style={styles.errorText}>{errors.clientId.message}</Text>}

            {services.length > 0 && (
              <View>
                <Text style={styles.label}>Serviço:</Text>
                <View style={styles.selectContainer}>
                  {services.map((service) => (
                    <Controller
                      key={service.id}
                      control={control}
                      name="serviceId"
                      render={({ field: { onChange, value } }) => (
                        <TouchableOpacity
                          style={[
                            styles.selectOption,
                            value === service.id && styles.selectOptionSelected,
                          ]}
                          onPress={() => onChange(service.id)}
                        >
                          <Text
                            style={[
                              styles.selectOptionText,
                              value === service.id && styles.selectOptionTextSelected,
                            ]}
                          >
                            {service.name} - R$ {service.price.toFixed(2)} ({service.durationMin}min)
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  ))}
                </View>
                {errors.serviceId && <Text style={styles.errorText}>{errors.serviceId.message}</Text>}
              </View>
            )}

            {staff.length > 0 && (
              <View>
                <Text style={styles.label}>Profissional:</Text>
                <View style={styles.selectContainer}>
                  {staff.map((member) => (
                    <Controller
                      key={member.id}
                      control={control}
                      name="staffId"
                      render={({ field: { onChange, value } }) => (
                        <TouchableOpacity
                          style={[
                            styles.selectOption,
                            value === member.id && styles.selectOptionSelected,
                          ]}
                          onPress={() => onChange(member.id)}
                        >
                          <Text
                            style={[
                              styles.selectOptionText,
                              value === member.id && styles.selectOptionTextSelected,
                            ]}
                          >
                            {member.userId}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  ))}
                </View>
                {errors.staffId && <Text style={styles.errorText}>{errors.staffId.message}</Text>}
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="date"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.date && styles.inputError]}
                      placeholder="Data (YYYY-MM-DD)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.date && (
                  <Text style={styles.errorText}>{errors.date.message}</Text>
                )}
              </View>

              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="time"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.time && styles.inputError]}
                      placeholder="Horário (HH:MM)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.time && (
                  <Text style={styles.errorText}>{errors.time.message}</Text>
                )}
              </View>
            </View>

            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Observações (opcional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                />
              )}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Criando...' : 'Criar Agendamento'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: -8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectOptionSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
