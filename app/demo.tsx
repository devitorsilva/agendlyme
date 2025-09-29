import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function DemoScreen() {
  const router = useRouter();

  const handleLogin = () => {
    Alert.alert('Demo', 'Funcionalidade de login será implementada após configurar o Firebase');
  };

  const handleRegister = () => {
    Alert.alert('Demo', 'Funcionalidade de cadastro será implementada após configurar o Firebase');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎉 AgendlyMe</Text>
        <Text style={styles.subtitle}>Sistema de Agendamento para Salões</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ MVP Implementado</Text>
          <Text style={styles.cardText}>
            • Sistema de autenticação{'\n'}
            • Gestão de salões{'\n'}
            • Cadastro de serviços{'\n'}
            • Sistema de agendamentos{'\n'}
            • Prevenção de conflitos{'\n'}
            • Integração Google Calendar{'\n'}
            • Lembretes por email{'\n'}
            • Regras de segurança
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔧 Próximo Passo</Text>
          <Text style={styles.cardText}>
            Configure o Firebase para ativar todas as funcionalidades:
          </Text>
          <Text style={styles.stepText}>
            1. Acesse console.firebase.google.com{'\n'}
            2. Crie um novo projeto{'\n'}
            3. Configure Authentication e Firestore{'\n'}
            4. Copie as credenciais{'\n'}
            5. Crie arquivo .env com as credenciais{'\n'}
            6. Reinicie o app
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login (Demo)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Cadastro (Demo)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>📋 Arquivos Importantes</Text>
          <Text style={styles.infoText}>
            • CONFIGURACAO_FIREBASE.md - Guia completo{'\n'}
            • env.example - Exemplo de configuração{'\n'}
            • README.md - Documentação completa{'\n'}
            • PROXIMOS_PASSOS.md - Roadmap
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3498db',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  buttons: {
    gap: 12,
    marginVertical: 24,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#34495e',
  },
});
