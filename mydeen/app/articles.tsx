import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator, FlatList, Image, Pressable,
    SafeAreaView, StyleSheet, Text, TextInput, View
} from "react-native";

type Category = "Quran" | "Hadith" | "History" | "Creed" | "Manhaj" | "Fiqh" | "Sharia";
type Article = {
  id: string;
  category: Category;
  title: string;
  author: string;
  authorAvatar?: string;
  cover: string;
  excerpt?: string;
};

const CATS: Category[] = ["Quran","Hadith","History","Creed","Manhaj","Fiqh","Sharia"];
const API = __DEV__ ? "http://192.168.18.5:4000" : "https://YOUR_API";

const Header = () => (
  <View style={s.header}>
    <Pressable style={s.iconBtn} onPress={() => router.back()}><Text style={s.icon}>‹</Text></Pressable>
    <Text style={s.hTitle}>Article</Text>
    <Pressable style={s.iconBtn}><Text style={s.icon}>⚙️</Text></Pressable>
  </View>
);

const Search = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <View style={s.search}>
    <Text style={{ opacity: .6 }}>🔎</Text>
    <TextInput
      placeholder="Search article title"
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChange}
      style={{ flex: 1, marginLeft: 8, paddingVertical: 10 }}
      returnKeyType="search"
      autoCapitalize="none"
    />
  </View>
);

const Tabs = ({ value, onChange }: { value: Category; onChange: (c: Category)=>void }) => (
  <View style={{ flexDirection:"row", gap:18, marginTop: 8 }}>
    {CATS.map(c => {
      const active = c===value;
      return (
        <Pressable key={c} onPress={() => onChange(c)} style={{ paddingBottom: 6 }}>
          <Text style={[s.tabText, active && { color:"#0F766E"}]}>{c}</Text>
          <View style={[s.tabLine, active && { backgroundColor:"#0F766E"}]} />
        </Pressable>
      );
    })}
  </View>
);

const ContinueCard = ({ a }: { a: Article }) => (
  <Pressable style={s.contCard} onPress={() => router.push({ pathname: "/article/[id]", params: { id: a.id } })}>
    <Image source={{ uri: a.cover }} style={s.contImg} />
    <Text style={s.tag}>Historical</Text>
    <Text style={s.title}>{a.title}</Text>
    <Text style={s.sub}>By {a.author}</Text>
  </Pressable>
);

const Row = ({ a }: { a: Article }) => (
  <Pressable style={s.row} onPress={() => router.push({ pathname: "/article/[id]", params: { id: a.id } })}>
    <Image source={{ uri: a.cover }} style={s.rowImg} />
    <View style={{ flex:1, marginLeft: 12 }}>
      <Text style={s.rowTag}>{a.category}</Text>
      <Text numberOfLines={2} style={s.rowTitle}>{a.title}</Text>
      <Text style={s.sub}>By {a.author}</Text>
    </View>
  </Pressable>
);

export default function ArticlesScreen() {
  const [cat, setCat] = useState<Category>("Quran");
  const [q, setQ] = useState("");
  const [continueA, setContinueA] = useState<Article | null>(null);
  const [featured, setFeatured] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => q.trim(), [q]);

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, fRes] = await Promise.all([
        fetch(`${API}/api/articles/continue?userId=u1`),
        fetch(`${API}/api/articles?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(query)}&limit=20`)
      ]);
      if (cRes.ok) {
        const cj = await cRes.json();
        setContinueA(cj?.item ?? null);
      }
      const fj = await fRes.json();
      setFeatured(fj.items ?? []);
    } catch (e) {
      setFeatured([]); setContinueA(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [cat, query]);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:"#fff" }}>
      <Header />
      <View style={{ padding:16 }}>
        <Search value={q} onChange={setQ} />

        <Text style={s.section}>Continue Reading</Text>
        {continueA ? <ContinueCard a={continueA} /> : <View style={{ height: 8 }} />}

        <View style={{ marginTop: 8 }}>
          <Text style={s.section}>Featured Article</Text>
          <Tabs value={cat} onChange={setCat} />
        </View>

        {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : (
          <FlatList
            data={featured}
            keyExtractor={i=>i.id}
            renderItem={({ item }) => <Row a={item} />}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingVertical: 12 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:{ height:56, paddingHorizontal:12, flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  iconBtn:{ width:36, height:36, borderRadius:18, backgroundColor:"#F3F4F6", alignItems:"center", justifyContent:"center" },
  icon:{ fontSize:18 }, hTitle:{ fontSize:16, fontWeight:"700", color:"#111827" },

  search:{ flexDirection:"row", alignItems:"center", borderWidth:1, borderColor:"#E5E7EB", borderRadius:16, paddingHorizontal:12 },
  section:{ marginTop:16, fontSize:18, fontWeight:"700", color:"#111827" },

  tabText:{ fontWeight:"700", color:"#6B7280" },
  tabLine:{ height:3, borderRadius:99, marginTop:6, backgroundColor:"transparent" },

  contCard:{ marginTop:10 },
  contImg:{ width:"100%", height:164, borderRadius:14 },
  tag:{ color:"#0F766E", marginTop:10, fontWeight:"700" },
  title:{ marginTop:4, fontSize:16, fontWeight:"700", color:"#111827" },
  sub:{ color:"#6B7280", marginTop:2 },

  row:{ flexDirection:"row", alignItems:"center" },
  rowImg:{ width:100, height:76, borderRadius:10 },
  rowTag:{ color:"#0F766E", fontWeight:"700", marginBottom:4 },
  rowTitle:{ fontSize:15, fontWeight:"700", color:"#111827" },
});
