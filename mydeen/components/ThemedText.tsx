import { useThemeColor } from "@/hooks/useThemeColor"; // ← ВАЖНО: правильный импорт
import { StyleSheet, Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export default function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text"); // ← теперь OK
  return <Text style={[{ color }, typeStyles[type], style]} {...rest} />;
}

const typeStyles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 28, fontWeight: "bold", lineHeight: 32 },
  defaultSemiBold: { fontSize: 16, fontWeight: "600", lineHeight: 24 },
  subtitle: { fontSize: 20, fontWeight: "bold" },
  link: { color: "#0F766E" },
});
