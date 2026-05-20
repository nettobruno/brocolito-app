import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { Input } from "@/src/components/Input";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";

export default function NewGroupScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) {
      setError("Informe o nome do grupo.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const group = await api.createCompetitionGroup({
        name: name.trim(),
        description: description.trim() || null,
        ends_on: endsOn.trim() || null,
      });
      router.replace({
        pathname: "/groups/[id]",
        params: { id: String(group.id) },
      });
    } catch (groupError) {
      setError(groupError instanceof Error ? groupError.message : "Não foi possível criar o grupo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Novo grupo</Text>
      <Text style={styles.subtitle}>Crie uma competição de constância baseada nos check-ins.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card style={styles.formCard}>
        <Input label="Nome" value={name} onChangeText={setName} placeholder="Ex: Projeto Verão" />
        <Input
          label="Descrição"
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Objetivo, regras ou contexto do grupo"
          style={styles.multilineInput}
        />
        <Input
          label="Data final"
          value={endsOn}
          onChangeText={setEndsOn}
          placeholder="AAAA-MM-DD"
          keyboardType="numbers-and-punctuation"
        />
        <Button title="Criar grupo" loading={saving} onPress={handleCreate} style={styles.button} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 26,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
    marginTop: 6,
  },
  formCard: {
    padding: 18,
  },
  multilineInput: {
    minHeight: 82,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 4,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
});
