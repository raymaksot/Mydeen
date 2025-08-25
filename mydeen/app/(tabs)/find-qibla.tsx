import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, ImageBackground, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import QiblaCompass from "../../components/QiblaCompass";
import QiblaSuccessModal from "../../components/QiblaSuccessModal";
import useHeading from "../../src/hooks/useHeading";
import useLocation from "../../src/hooks/useLocation";
import { angleDelta, qiblaBearing, toDMS } from "../../src/lib/qibla";

export default function FindQiblaScreen() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [lockedHeading, setLockedHeading] = useState<number | null>(null);

  const BAND = 6;      // порог срабатывания
  const REARM = 12;    // порог «разармирования» (гистерезис)
  const [armed, setArmed] = useState(true);

  // при Success паузим датчик
  const liveHeading = useHeading(showSuccess);
  const heading = showSuccess ? (lockedHeading ?? liveHeading ?? 0) : (liveHeading ?? 0);

  const { coords } = useLocation();
  const lat = coords?.lat ?? 21.8833;
  const lng = coords?.lng ?? -102.3;

  const bearing = useMemo(() => qiblaBearing(lat, lng), [lat, lng]);
  const delta = Math.abs(Math.round(angleDelta(bearing, heading)));

  // авто-показ успеха и фиксация значения
  useEffect(() => {
    if (liveHeading == null) return;

  const d = Math.abs(angleDelta(bearing, liveHeading));

  // показ Success ТОЛЬКО при переходе в коридор и когда "armed"
  if (!showSuccess && armed && d <= BAND) {
    setLockedHeading(liveHeading);
    setShowSuccess(true);
  }

  // реарм: пользователь отошёл от киблы достаточно далеко
  if (!armed && d >= REARM) setArmed(true);
  }, [liveHeading, bearing, showSuccess, armed]);

  const onClose = () => {
  setShowSuccess(false);
  setLockedHeading(null);
  setArmed(false);          
  };

  const H = Dimensions.get("window").height;
  const compassOffset = Math.min(Math.round(H * 0.2), 160); // ↓ ниже на 20%

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <Pressable style={s.iconBtn}><Text style={s.iconText}>‹</Text></Pressable>
        <Text style={s.headerTitle}>Find Qibla</Text>
        <Pressable style={s.iconBtn}><Text style={s.iconText}>📍</Text></Pressable>
      </View>

      <ImageBackground source={require("../../assets/images/Qibla.jpg")} style={s.photo} imageStyle={{ resizeMode: "cover" }}>
        <View style={s.overlay} />
        <View style={s.centerLine} />
        {/* плашку координат поднял: фиксированное положение от низа */}
        <View style={s.coordsPill}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>⦿ {toDMS(lat, lng)}</Text>
        </View>
      </ImageBackground>

      {/* блок компаса опущен вниз */}
      <View style={[s.compassBlock, { marginTop: compassOffset }]}>
        <QiblaCompass qiblaBearing={bearing} heading={heading} />
      </View>

      {/* модалка сверху, компас фиксируется пока не нажмём Close */}
      <QiblaSuccessModal visible={showSuccess} onClose={onClose} placement="top" />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#F3F4F6" },
  iconText: { fontSize: 18, color: "#111827" },

  photo: { height: 280, justifyContent: "flex-end" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.12)" },
  centerLine: { position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, marginLeft: -1, borderLeftWidth: 2, borderLeftColor: "#ffffff", borderStyle: "dashed", opacity: 0.8 },
  coordsPill: {
    position: "absolute", bottom: 28, // ← ЧУТЬ ВЫШЕ
    alignSelf: "center",
    backgroundColor: "#0B0E18", paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 22, borderWidth: 2, borderColor: "rgba(255,255,255,0.12)",
  },

  compassBlock: { backgroundColor: "#fff", alignItems: "center", paddingTop: 0, paddingHorizontal: 16, paddingBottom: 24 },
});