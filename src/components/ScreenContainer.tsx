import { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/src/theme/colors";

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  centered?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function ScreenContainer({
  children,
  scroll = true,
  centered = false,
  style,
}: ScreenContainerProps) {
  const content = (
    <View style={[styles.content, centered && styles.centered, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, centered && styles.centered]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});

