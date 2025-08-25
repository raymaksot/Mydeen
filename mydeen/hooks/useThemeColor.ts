// hooks/useThemeColor.ts
import useColorScheme from "@/hooks/useColorScheme";

const Colors = {
  light: {
    text: "#11181C",
    background: "#FFFFFF",
    tint: "#0F766E",
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#0F766E",
  },
  dark: {
    text: "#ECEDEE",
    background: "#111418",
    tint: "#34D399",
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#34D399",
  },
};
type Theme = keyof typeof Colors;
type ColorName = keyof typeof Colors.light;

/** Возвращает цвет по текущей теме, с возможной подменой через props */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const theme = (useColorScheme() as Theme) ?? "light";
  const fromProps = props[theme];
  return fromProps ?? Colors[theme][colorName];
}

export { Colors };

