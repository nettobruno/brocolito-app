import { ReactNode } from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  rightElement?: ReactNode;
};

export function Input({ label, error, rightElement, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputShell, error && styles.inputError]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          {...props}
        />
        {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 7,
    marginBottom: 14,
    width: "100%",
  },
  label: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 14,
  },
  inputShell: {
    alignItems: "center",
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    color: colors.primary,
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    paddingVertical: 12,
  },
  rightElement: {
    marginLeft: 8,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
  },
});
