import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { angleDelta } from "../src/lib/qibla";

export default function QiblaCompass({ qiblaBearing, heading }: { qiblaBearing: number; heading: number | null }) {
  const h = heading ?? 0;
  const delta = angleDelta(qiblaBearing, h);

  return (
    <View style={s.wrap}>
      <View style={s.dial}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[s.tick, { transform: [{ rotate: `${(i * 360) / 12}deg` }] }]} />
        ))}

        {/* курс устройства (серый) */}
        <View style={[s.needleWrap, { transform: [{ rotate: `${-h}deg` }] }]}>
          <View style={[s.needle, { borderBottomColor: "#D1D5DB" }]} />
        </View>

        {/* направление киблы (жёлто-зелёная) */}
        <View style={[s.needleWrap, { transform: [{ rotate: `${delta}deg` }] }]}>
          <View style={[s.needle, { borderBottomColor: "#FBBF24" }]} />
        </View>

        <View style={s.center} />
      </View>
      <Text style={s.caption}>Δ {Math.abs(Math.round(delta))}° → до Киблы</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center" },
  dial: {
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "#E6FBF3", borderWidth: 10, borderColor: "#EAF7F1",
    justifyContent: "center", alignItems: "center",
  },
  tick: { position: "absolute", width: 2, height: 12, backgroundColor: "#9CA3AF", top: 8 },
  needleWrap: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-start", alignItems: "center" },
  needle: {
    width: 0, height: 0,
    borderLeftWidth: 12, borderRightWidth: 12, borderBottomWidth: 105,
    borderLeftColor: "transparent", borderRightColor: "transparent",
  },
  center: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#065F46", borderWidth: 2, borderColor: "#ECFDF5" },
  caption: { marginTop: 10, color: "#6B7280", fontWeight: "600" },
});
