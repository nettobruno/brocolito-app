import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { Input } from "@/src/components/Input";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { CompetitionGroup } from "@/src/types";

function formatEndDate(value?: string | null) {
  if (!value) {
    return "Sem data final";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<CompetitionGroup | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadGroup = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await api.getCompetitionGroup(id);
      setGroup(response);
    } catch (groupError) {
      setError(groupError instanceof Error ? groupError.message : "Não foi possível carregar o grupo.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadGroup();
    }, [loadGroup]),
  );

  async function handleInvite() {
    if (!id || !inviteEmail.trim()) {
      setError("Informe o e-mail do usuário convidado.");
      return;
    }

    try {
      setInviting(true);
      setError("");
      setMessage("");
      await api.inviteToCompetitionGroup(id, inviteEmail.trim());
      setInviteEmail("");
      setMessage("Convite enviado.");
      await loadGroup();
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Não foi possível enviar o convite.");
    } finally {
      setInviting(false);
    }
  }

  const ranking = group?.ranking ?? [];
  const leader = ranking[0];

  return (
    <ScreenContainer>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {group ? (
        <>
          <Card style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroIcon}>
                <Ionicons name="trophy-outline" size={26} color={colors.white} />
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{group.name}</Text>
                <Text style={styles.heroSubtitle}>{group.member_count} participantes</Text>
              </View>
            </View>
            {group.description ? <Text style={styles.heroDescription}>{group.description}</Text> : null}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Final</Text>
                <Text style={styles.metaValue}>{formatEndDate(group.ends_on)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Líder</Text>
                <Text style={styles.metaValue}>{leader?.user.name ?? "Sem ranking"}</Text>
              </View>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Ranking</Text>
          <View style={styles.rankingList}>
            {ranking.map((entry) => (
              <Card key={entry.user.id} style={[styles.rankingCard, entry.position === 1 && styles.leaderCard]}>
                <View style={[styles.positionBadge, entry.position === 1 && styles.positionBadgeLeader]}>
                  <Text style={[styles.positionText, entry.position === 1 && styles.positionTextLeader]}>
                    {entry.position}
                  </Text>
                </View>
                <View style={styles.rankingCopy}>
                  <Text style={styles.memberName}>{entry.user.name}</Text>
                  <Text style={styles.memberEmail}>{entry.user.email}</Text>
                </View>
                <View style={styles.scoreBlock}>
                  <Text style={styles.scoreValue}>{entry.trained_check_ins}</Text>
                  <Text style={styles.scoreLabel}>treinos</Text>
                </View>
              </Card>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Convidar</Text>
          <Card style={styles.inviteCard}>
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="E-mail"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="usuario@exemplo.com"
            />
            <Button title="Enviar convite" loading={inviting} onPress={handleInvite} />
          </Card>

          {(group.pending_invitations?.length ?? 0) > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Convites pendentes</Text>
              <View style={styles.pendingList}>
                {group.pending_invitations?.map((invitation) => (
                  <View key={invitation.id} style={styles.pendingItem}>
                    <Text style={styles.pendingName}>{invitation.invitee.name}</Text>
                    <Text style={styles.pendingEmail}>{invitation.invitee.email}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.primary,
    borderColor: "transparent",
    padding: 20,
  },
  heroHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 999,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 25,
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.76)",
    fontFamily: fontFamily.semiBold,
    marginTop: 3,
  },
  heroDescription: {
    color: "rgba(255, 255, 255, 0.86)",
    fontFamily: fontFamily.semiBold,
    lineHeight: 21,
    marginTop: 16,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  metaItem: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 16,
    flex: 1,
    padding: 12,
  },
  metaLabel: {
    color: "rgba(255, 255, 255, 0.72)",
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
  },
  metaValue: {
    color: colors.white,
    fontFamily: fontFamily.extraBold,
    fontSize: 14,
    marginTop: 5,
    textTransform: "capitalize",
  },
  sectionTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
  },
  rankingList: {
    gap: 10,
  },
  rankingCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  leaderCard: {
    backgroundColor: "rgba(185, 100, 48, 0.12)",
    borderColor: "rgba(185, 100, 48, 0.32)",
  },
  positionBadge: {
    alignItems: "center",
    backgroundColor: "rgba(100, 148, 109, 0.14)",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  positionBadgeLeader: {
    backgroundColor: colors.accent,
  },
  positionText: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 16,
  },
  positionTextLeader: {
    color: colors.white,
  },
  rankingCopy: {
    flex: 1,
  },
  memberName: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 16,
  },
  memberEmail: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    marginTop: 2,
  },
  scoreBlock: {
    alignItems: "flex-end",
  },
  scoreValue: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 22,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
  },
  inviteCard: {
    padding: 16,
  },
  pendingList: {
    gap: 8,
  },
  pendingItem: {
    backgroundColor: "rgba(255, 255, 255, 0.58)",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  pendingName: {
    color: colors.title,
    fontFamily: fontFamily.bold,
  },
  pendingEmail: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    marginTop: 2,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
  message: {
    color: colors.primary,
    fontFamily: fontFamily.extraBold,
    marginBottom: 12,
  },
});
