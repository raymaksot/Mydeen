import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { openYoutubeVideo } from "../src/lib/openYoutubeVideo";

/** ─────────── Типы и константы ─────────── */
type Category = "Quran" | "Hadith" | "History" | "Creed" | "Manhaj" | "Fiqh";
type Video = {
  id: string;
  youtubeId?: string;
  title: string;
  author: string;
  duration: string;         // "15:21"
  thumb: string;            // url
  category: Category;
  progress?: number;        // 0..1 для Recently Viewed
};

const CATS: Category[] = ["Quran", "Hadith", "History", "Creed", "Manhaj", "Fiqh"];
const API = __DEV__ ? "http://192.168.18.5:4000" : "https://YOUR_API_HOST";

/** ─────────── Мелкие UI ─────────── */
const Header = () => (
  <View style={s.header}>
    <Pressable style={s.iconBtn} onPress={() => router.back()}><Text style={s.iconTxt}>‹</Text></Pressable>
    <Text style={s.hTitle}>Cult Videos</Text>
    <Pressable style={s.iconBtn}><Text style={s.iconTxt}>⚙️</Text></Pressable>
  </View>
);

const SearchBar = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <View style={s.search}>
    <Text style={{ fontSize: 16, opacity: 0.5 }}>🔎</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="Search surah or Verse"
      placeholderTextColor="#9CA3AF"
      style={{ flex: 1, paddingVertical: 10, marginLeft: 8 }}
      autoCapitalize="none"
      returnKeyType="search"
    />
  </View>
);

const Tabs = ({ value, onChange }: { value: Category; onChange: (v: Category) => void }) => (
  <View style={{ flexDirection: "row", gap: 18, paddingHorizontal: 4, marginTop: 8 }}>
    {CATS.map((c) => {
      const active = c === value;
      return (
        <Pressable key={c} onPress={() => onChange(c)} style={{ paddingBottom: 8 }}>
          <Text style={[s.tabText, active && { color: "#0F766E" }]}>{c}</Text>
          <View style={[s.tabLine, active && { backgroundColor: "#0F766E" }]} />
        </Pressable>
      );
    })}
  </View>
);

const DurationBadge = ({ text }: { text: string }) => (
  <View style={s.badge}><Text style={s.badgeTxt}>{text}</Text></View>
);

const FeaturedCard = ({ v }: { v: Video }) => (
  <Pressable style={s.fCard} onPress={() => v.youtubeId && openYoutubeVideo(v.youtubeId)}>
    <Image source={{ uri: v.thumb }} style={s.fImg} />
    <DurationBadge text={v.duration} />
    <Text numberOfLines={2} style={s.fTitle}>{v.title}</Text>
    <Text style={s.sub}>By {v.author}</Text>
  </Pressable>
);

const RecentRow = ({ v }: { v: Video }) => (
  <Pressable style={s.rRow} onPress={() => v.youtubeId && openYoutubeVideo(v.youtubeId)}>
    <Image source={{ uri: v.thumb }} style={s.rImg} />
    <DurationBadge text={v.duration} />
    <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
      <Text numberOfLines={2} style={s.rTitle}>{v.title}</Text>
      <Text style={s.sub}>By {v.author}</Text>
      {typeof v.progress === "number" && (
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${Math.max(0, Math.min(100, v.progress * 100))}%` }]} />
        </View>
      )}
    </View>
  </Pressable>
);

/** ─────────── Экран ─────────── */
export default function CultVideosScreen() {
  const { category } = useLocalSearchParams<{ category?: Category }>();
  const [cat, setCat] = useState<Category>(category ?? "Quran");
  const [q, setQ] = useState("");
  const [featured, setFeatured] = useState<Video[] | null>(null);
  const [recent, setRecent] = useState<Video[] | null>(null);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => q.trim(), [q]);

  const load = async () => {
    setLoading(true);
    try {
      const [fRes, rRes] = await Promise.all([
        fetch(`${API}/api/videos?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(query)}&limit=10`),
        fetch(`${API}/api/videos/recent?limit=20&category=${encodeURIComponent(cat)}&q=${encodeURIComponent(query)}&userId=u1`),
      ]);
      const fJson = await fRes.json();
      const rJson = await rRes.json();
      setFeatured(fJson.items as Video[]);
      setRecent(rJson.items as Video[]);
    } catch (e) {
      console.log("load videos error", e);
      setFeatured([]);
      setRecent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [cat, query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={{ padding: 16 }}>
        <SearchBar value={q} onChange={setQ} />

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Featured Cult</Text>
          <Pressable onPress={() => load()}><Text style={s.seeAll}>See All</Text></Pressable>
        </View>

        <Tabs value={cat} onChange={setCat} />

        {!featured || loading ? (
          <ActivityIndicator style={{ marginVertical: 16 }} />
        ) : (
          <FlatList
            data={featured}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingVertical: 12, paddingRight: 12 }}
            renderItem={({ item }) => <FeaturedCard v={item} />}
          />
        )}

        <Text style={[s.sectionTitle, { marginTop: 6 }]}>Recently Viewed</Text>

        {!recent || loading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : (
          <View style={{ gap: 14, marginTop: 8, paddingBottom: 16 }}>
            {recent.map((v) => <RecentRow key={v.id} v={v} />)}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/** ─────────── Стили ─────────── */
const s = StyleSheet.create({
  header: {
    paddingHorizontal: 12, height: 56, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  iconTxt: { fontSize: 18 },
  hTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },

  search: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, paddingHorizontal: 12, marginTop: 8,
  },

  sectionHeader: { marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  seeAll: { color: "#0F766E", fontWeight: "700" },

  tabText: { fontWeight: "700", color: "#6B7280" },
  tabLine: { height: 3, borderRadius: 999, marginTop: 8, backgroundColor: "transparent" },

  fCard: { width: 230, marginRight: 12 },
  fImg: { width: "100%", height: 136, borderRadius: 14 },
  fTitle: { marginTop: 10, fontWeight: "700", color: "#111827" },
  sub: { color: "#6B7280", marginTop: 2 },

  badge: {
    position: "absolute", left: 10, top: 10, paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.7)", borderRadius: 999,
  },
  badgeTxt: { color: "#fff", fontWeight: "700", fontSize: 12 },

  rRow: { borderRadius: 16, overflow: "hidden", backgroundColor: "#fff", elevation: 1, shadowOpacity: 0.06, shadowRadius: 6 },
  rImg: { width: "100%", height: 164 },
  rTitle: { fontWeight: "700", fontSize: 15, color: "#111827" },

  progressBar: { height: 4, backgroundColor: "#E5E7EB", borderRadius: 999, marginTop: 8, overflow: "hidden" },
  progressFill: { height: 4, backgroundColor: "#0F766E" },
});
