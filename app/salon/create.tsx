import React, { useState } from 'react';
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
import { useAuthStore } from '../../src/store/authStore';
import { useSalonStore } from '../../src/store/salonStore';
import { SalonService } from '../../src/services/salonService';

const salonSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  workingHoursStart: z.string().min(1, 'Horário de início é obrigatório'),
  workingHoursEnd: z.string().min(1, 'Horário de fim é obrigatório'),
  timezone: z.string().min(1, 'Fuso horário é obrigatório'),
});

type SalonFormData = z.infer<typeof salonSchema>;

export default function CreateSalonScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setCurrentSalon } = useSalonStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SalonFormData>({
    resolver: zodResolver(salonSchema),
    defaultValues: {
      workingHoursStart: '08:00',
      workingHoursEnd: '18:00',
      timezone: 'America/Sao_Paulo',
    },
  });

  const onSubmit = async (data: SalonFormData) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const salonData = {
        name: data.name,
        address: data.address,
        ownerId: user.id,
        config: {
          workingHours: {
            start: data.workingHoursStart,
            end: data.workingHoursEnd,
          },
          holidays: [],
          timezone: data.timezone,
        },
      };

      const salonId = await SalonService.createSalon(salonData);
      const salon = await SalonService.getSalon(salonId);
      
      if (salon) {
        setCurrentSalon(salon);
        Alert.alert('Sucesso', 'Salão criado com sucesso!', [
          { text: 'OK', onPress: () => router.replace('/dashboard') }
        ]);
      }
    } catch (error) {
      console.error('Erro ao criar salão:', error);
      Alert.alert('Erro', 'Falha ao criar salão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Criar Salão</Text>
          <Text style={styles.subtitle}>Preencha os dados do seu salão</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Nome do salão"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  placeholder="Endereço completo"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                />
              )}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="workingHoursStart"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.workingHoursStart && styles.inputError]}
                      placeholder="Início (08:00)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.workingHoursStart && (
                  <Text style={styles.errorText}>{errors.workingHoursStart.message}</Text>
                )}
              </View>

              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="workingHoursEnd"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.workingHoursEnd && styles.inputError]}
                      placeholder="Fim (18:00)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.workingHoursEnd && (
                  <Text style={styles.errorText}>{errors.workingHoursEnd.message}</Text>
                )}
              </View>
            </View>

            <Controller
              control={control}
              name="timezone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.timezone && styles.inputError]}
                  placeholder="Fuso horário (America/Sao_Paulo)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.timezone && <Text style={styles.errorText}>{errors.timezone.message}</Text>}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Criando...' : 'Criar Salão'}
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
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: -8,
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
