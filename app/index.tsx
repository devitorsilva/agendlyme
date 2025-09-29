import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgendlyMe</Text>
      <Text style={styles.subtitle}>Sistema de Agendamento para Saloes</Text>

      <View style={styles.buttons}>
        <Link href="/simple" style={styles.button}>
          <Text style={styles.buttonText}>Ver Demo 1</Text>
        </Link>

        <Link href="/demo" style={styles.button}>
          <Text style={styles.buttonText}>Ver Demo 2</Text>
        </Link>

        <Link href="/login" style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </Link>

        <Link href="/register" style={styles.button}>
          <Text style={styles.buttonText}>Cadastro</Text>
        </Link>
      </View>

      <Text style={styles.info}>
        MVP completo implementado com Firebase, autenticacao, agendamentos e muito mais!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttons: {
    gap: 16,
    marginBottom: 32,
    width: '100%',
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
