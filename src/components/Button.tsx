import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "outline" | "danger";
  style?: ViewStyle;
};

export function Button({ title, onPress, loading = false, variant = "primary", style }: ButtonProps) {
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";

  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isOutline && styles.outline,
        isDanger && styles.danger,
        pressed && styles.pressed,
        loading && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, isOutline && styles.outlineText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: colors.primary,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  pressed: {
    opacity: 0.84,
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    color: colors.white,
    fontFamily: fontFamily.extraBold,
    fontSize: 16,
  },
  outlineText: {
    color: colors.primary,
  },
});
