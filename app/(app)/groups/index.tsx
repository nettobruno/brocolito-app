import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { ScreenContainer } from "@/src/components/ScreenContainer";
import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { CompetitionGroup, GroupInvitation } from "@/src/types";

function formatEndDate(value?: string | null) {
  if (!value) {
    return "Sem data final";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function GroupsScreen() {
  const [groups, setGroups] = useState<CompetitionGroup[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [groupsResponse, invitationsResponse] = await Promise.all([
        api.listCompetitionGroups(),
        api.listGroupInvitations(),
      ]);
      setGroups(groupsResponse);
      setInvitations(invitationsResponse);
    } catch (groupsError) {
      setError(groupsError instanceof Error ? groupsError.message : "Não foi possível carregar seus grupos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups]),
  );

  async function respondToInvitation(invitationId: number, action: "accept" | "decline") {
    try {
      setRespondingId(invitationId);
      setError("");
      if (action === "accept") {
        await api.acceptGroupInvitation(invitationId);
      } else {
        await api.declineGroupInvitation(invitationId);
      }
      await loadGroups();
    } catch (invitationError) {
      setError(invitationError instanceof Error ? invitationError.message : "Não foi possível responder ao convite.");
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Grupos</Text>
          <Text style={styles.subtitle}>Compita por constância com seus amigos.</Text>
        </View>
        <Button title="Novo" onPress={() => router.push("/new-group")} style={styles.newButton} />
      </View>

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {invitations.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Convites</Text>
          {invitations.map((invitation) => (
            <Card key={invitation.id} style={styles.invitationCard}>
              <View style={styles.cardHeader}>
                <View style={styles.groupIcon}>
                  <Ionicons name="mail-outline" size={22} color={colors.white} />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{invitation.competition_group.name}</Text>
                  <Text style={styles.cardText}>Convite de {invitation.inviter.name}</Text>
                </View>
              </View>
              <View style={styles.invitationActions}>
                <Button
                  title="Recusar"
                  variant="outline"
                  loading={respondingId === invitation.id}
                  onPress={() => respondToInvitation(invitation.id, "decline")}
                  style={styles.invitationButton}
                />
                <Button
                  title="Entrar"
                  loading={respondingId === invitation.id}
                  onPress={() => respondToInvitation(invitation.id, "accept")}
                  style={styles.invitationButton}
                />
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meus grupos</Text>
        {!loading && groups.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum grupo ainda.</Text>
            <Text style={styles.emptyText}>Crie um grupo ou aceite um convite para começar o ranking.</Text>
          </Card>
        ) : null}

        <View style={styles.list}>
          {groups.map((group) => (
            <Pressable
              accessibilityRole="button"
              key={group.id}
              onPress={() =>
                router.push({
                  pathname: "/groups/[id]",
                  params: { id: String(group.id) },
                })
              }
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Card style={styles.groupCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.groupIcon}>
                    <Ionicons name="people-outline" size={23} color={colors.white} />
                  </View>
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>{group.name}</Text>
                    <Text style={styles.cardText}>{group.member_count} participantes</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </View>
                {group.description ? <Text style={styles.description}>{group.description}</Text> : null}
                <Text style={styles.endDate}>Fim: {formatEndDate(group.ends_on)}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 26,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    lineHeight: 21,
    marginTop: 4,
  },
  newButton: {
    minHeight: 44,
    minWidth: 82,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    marginBottom: 10,
  },
  list: {
    gap: 12,
  },
  groupCard: {
    padding: 16,
  },
  invitationCard: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  groupIcon: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
  cardText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    marginTop: 3,
  },
  description: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    lineHeight: 20,
    marginTop: 12,
  },
  endDate: {
    color: colors.accent,
    fontFamily: fontFamily.extraBold,
    fontSize: 13,
    marginTop: 10,
  },
  invitationActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  invitationButton: {
    flex: 1,
    minHeight: 44,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 28,
  },
  emptyTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 19,
    textAlign: "center",
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.84,
  },
});
