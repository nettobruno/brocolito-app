import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme/colors";
import { fontFamily } from "@/src/theme/typography";
import { WeightGoal } from "@/src/types";
import { weightGoalOptions } from "@/src/utils/goals";

type WeightGoalSelectorProps = {
  value: WeightGoal;
  onChange: (value: WeightGoal) => void;
};

export function WeightGoalSelector({ value, onChange }: WeightGoalSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Objetivo</Text>
      <View style={styles.options}>
        {weightGoalOptions.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                {option.label}
              </Text>
              <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 15,
    marginBottom: 8,
  },
  options: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 92,
    padding: 12,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionTitle: {
    color: colors.title,
    fontFamily: fontFamily.bold,
    fontSize: 15,
  },
  optionTitleSelected: {
    color: colors.white,
  },
  optionDescription: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  optionDescriptionSelected: {
    color: "rgba(255, 255, 255, 0.82)",
  },
  pressed: {
    opacity: 0.84,
  },
});
