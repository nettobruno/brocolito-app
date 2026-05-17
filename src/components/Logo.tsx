import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native";

type LogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function Logo({ size = 132, style }: LogoProps) {
  return (
    <Image
      source={require("@/assets/images/brocolito-avatar.png")}
      style={[styles.logo, { width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
  },
});

