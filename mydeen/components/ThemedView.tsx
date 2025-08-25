import { useThemeColor } from "@/hooks/useThemeColor"; // ← правильный импорт
import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  ); // ← теперь OK

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
