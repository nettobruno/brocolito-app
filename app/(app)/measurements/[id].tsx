import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { MeasurementForm } from "@/src/components/MeasurementForm";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { BodyMeasurement, MeasurementPayload } from "@/src/types";
import { formatMeasurementDate } from "@/src/utils/measurements";

export default function MeasurementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [measurement, setMeasurement] = useState<BodyMeasurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMeasurement() {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        setMeasurement(await api.getMeasurement(id));
      } catch (detailError) {
        setError(detailError instanceof Error ? detailError.message : "Não foi possível carregar.");
      } finally {
        setLoading(false);
      }
    }

    loadMeasurement();
  }, [id]);

  async function handleSubmit(payload: MeasurementPayload) {
    if (!id) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMeasurement(await api.updateMeasurement(id, payload));
      router.replace("/history");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!id) {
      return;
    }

    setIsDeleteModalVisible(true);
  }

  async function handleDelete() {
    if (!id) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await api.deleteMeasurement(id);
      setIsDeleteModalVisible(false);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/history");
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Detalhe da medição</Text>
      {measurement ? <Text style={styles.subtitle}>{formatMeasurementDate(measurement)}</Text> : null}
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {measurement ? (
        <View>
          <MeasurementForm
            initialMeasurement={measurement}
            submitLabel="Salvar alterações"
            loading={saving}
            onSubmit={handleSubmit}
          />
          <Button title="Excluir medição" variant="danger" onPress={confirmDelete} style={styles.deleteButton} />
        </View>
      ) : null}

      <Modal
        animationType="fade"
        transparent
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsDeleteModalVisible(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Excluir medição?</Text>
            <Text style={styles.modalText}>
              Essa ação não pode ser desfeita. A medição será removida do seu histórico.
            </Text>
            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setIsDeleteModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Excluir"
                variant="danger"
                loading={deleting}
                onPress={handleDelete}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 14,
    marginTop: 6,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
  deleteButton: {
    marginTop: 14,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
    width: "100%",
    maxWidth: 420,
  },
  modalTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    textAlign: "center",
  },
  modalText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});
