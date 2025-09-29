import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function SimpleScreen() {
  return (
    <View style={styles.container}>
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

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login (Demo)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Cadastro (Demo)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Dashboard (Demo)</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.info}>
        MVP completo implementado! Todas as funcionalidades estão prontas para uso.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 24,
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
  buttons: {
    gap: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
});
