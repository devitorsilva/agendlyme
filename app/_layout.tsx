import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'AgendlyMe' }} />
        <Stack.Screen name="simple" options={{ title: 'Demo 1' }} />
        <Stack.Screen name="demo" options={{ title: 'Demo 2' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="register" options={{ title: 'Cadastro' }} />
        <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="salon" options={{ title: 'Salao' }} />
        <Stack.Screen name="appointments" options={{ title: 'Agendamentos' }} />
        <Stack.Screen name="services" options={{ title: 'Servicos' }} />
        <Stack.Screen name="staff" options={{ title: 'Equipe' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
