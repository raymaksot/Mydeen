import React from "react";
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

export default function QiblaSuccessModal({
  visible,
  onClose,
  placement = "top", // ← по умолчанию сверху
}: {
  visible: boolean;
  onClose: () => void;
  placement?: "center" | "top";
}) {
  const containerStyle = [
    s.backdrop,
    placement === "top"
      ? { justifyContent: "flex-start", paddingTop: 80 } as ViewStyle
      : placement === "center"
      ? { justifyContent: "center", paddingTop: 0 } as ViewStyle
      : {},
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={containerStyle}>
        <View style={s.card}>
          <View style={s.logoWrap}>
            <View style={s.kaabaTop} />
            <View style={s.kaabaBody} />
            <View style={s.badge}>
              <Text style={{ color: "#fff", fontWeight: "800" }}>✓</Text>
            </View>
          </View>

          <Text style={s.title}>Qibla Position Founded!</Text>
          <Text style={s.text}>
            Yey! You have successfully found the Qibla position, now you can perform the prayer
          </Text>

          <Pressable onPress={onClose} style={s.btn}>
            <Text style={s.btnText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", padding: 16 },
  card: { width: "100%", maxWidth: 340, backgroundColor: "#fff", borderRadius: 24, padding: 20 },
  logoWrap: { alignSelf: "center", width: 96, height: 96, borderRadius: 48, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  kaabaTop: { position: "absolute", width: 52, height: 14, backgroundColor: "#F59E0B", top: 34, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  kaabaBody: { width: 52, height: 36, backgroundColor: "#111827", borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  badge: { position: "absolute", right: -2, top: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: "#059669", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#fff" },
  title: { marginTop: 14, textAlign: "center", color: "#111827", fontSize: 18, fontWeight: "700" },
  text: { marginTop: 6, textAlign: "center", color: "#6B7280" },
  btn: { marginTop: 16, backgroundColor: "#0F766E", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
