import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSalonStore } from "../../src/store/salonStore";
import { SalonService } from "../../src/services/salonService";

export default function SalonSettingsScreen(): JSX.Element {
  const router = useRouter();
  const { currentSalon, setCurrentSalon } = useSalonStore();
  const [name, setName] = useState(currentSalon?.name ?? "");
  const [address, setAddress] = useState(currentSalon?.address ?? "");
  const [workStart, setWorkStart] = useState(
    currentSalon?.config.workingHours.start ?? "08:00"
  );
  const [workEnd, setWorkEnd] = useState(
    currentSalon?.config.workingHours.end ?? "18:00"
  );
  const [timezone, setTimezone] = useState(
    currentSalon?.config.timezone ?? "America/Sao_Paulo"
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!currentSalon) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nenhum salao selecionado</Text>
        <Text style={styles.emptySubtitle}>
          Volte para o dashboard para escolher um salao antes de acessar as configuracoes.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updatedConfig = {
        ...currentSalon.config,
        workingHours: {
          start: workStart,
          end: workEnd,
        },
        timezone,
      };

      await SalonService.updateSalon(currentSalon.id, {
        name,
        address,
        config: updatedConfig,
      });

      setCurrentSalon({
        ...currentSalon,
        name,
        address,
        config: updatedConfig,
      });

      Alert.alert("Sucesso", "Configuracoes atualizadas com sucesso.");
      router.back();
    } catch (error) {
      console.error("Erro ao atualizar salao:", error);
      Alert.alert(
        "Erro",
        "Nao foi possivel atualizar as configuracoes. Tente novamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Configuracoes do Salao</Text>
      <Text style={styles.subtitle}>
        Atualize as informacoes principais do salao e seus horarios padrao.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nome do Salao</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Estudio da Beleza"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Endereco</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={address}
          onChangeText={setAddress}
          placeholder="Rua Exemplo, 123"
          multiline
        />
      </View>

      <View style={styles.inlineGroup}>
        <View style={styles.inlineItem}>
          <Text style={styles.label}>Inicio do expediente</Text>
          <TextInput
            style={styles.input}
            value={workStart}
            onChangeText={setWorkStart}
            placeholder="08:00"
          />
        </View>
        <View style={styles.inlineItem}>
          <Text style={styles.label}>Fim do expediente</Text>
          <TextInput
            style={styles.input}
            value={workEnd}
            onChangeText={setWorkEnd}
            placeholder="18:00"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fuso horario</Text>
        <TextInput
          style={styles.input}
          value={timezone}
          onChangeText={setTimezone}
          placeholder="America/Sao_Paulo"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? "Salvando..." : "Salvar configuracoes"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={isSaving}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inlineGroup: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  inlineItem: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
