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
import { useSalonStore } from '../../src/store/salonStore';
import { SalonService } from '../../src/services/salonService';

const serviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  category: z.string().min(2, 'Categoria deve ter pelo menos 2 caracteres'),
  price: z.string().min(1, 'Preço é obrigatório'),
  durationMin: z.string().min(1, 'Duração é obrigatória'),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function CreateServiceScreen() {
  const router = useRouter();
  const { currentSalon, addService } = useSalonStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  const onSubmit = async (data: ServiceFormData) => {
    if (!currentSalon) {
      Alert.alert('Erro', 'Nenhum salão selecionado');
      return;
    }

    try {
      setIsLoading(true);
      
      const serviceData = {
        salonId: currentSalon.id,
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        durationMin: parseInt(data.durationMin),
        isActive: true,
      };

      const serviceId = await SalonService.createService(serviceData);
      
      const newService = {
        id: serviceId,
        ...serviceData,
      };
      
      addService(newService);
      
      Alert.alert('Sucesso', 'Serviço criado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      Alert.alert('Erro', 'Falha ao criar serviço');
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
          <Text style={styles.title}>Criar Serviço</Text>
          <Text style={styles.subtitle}>Preencha os dados do serviço</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Nome do serviço"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.category && styles.inputError]}
                  placeholder="Categoria (ex: Corte, Coloração, Tratamento)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.price && styles.inputError]}
                      placeholder="Preço (R$)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                    />
                  )}
                />
                {errors.price && (
                  <Text style={styles.errorText}>{errors.price.message}</Text>
                )}
              </View>

              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="durationMin"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.durationMin && styles.inputError]}
                      placeholder="Duração (min)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="number-pad"
                    />
                  )}
                />
                {errors.durationMin && (
                  <Text style={styles.errorText}>{errors.durationMin.message}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Criando...' : 'Criar Serviço'}
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
