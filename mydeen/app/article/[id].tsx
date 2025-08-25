import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator, Image, Pressable, SafeAreaView,
    ScrollView, StyleSheet, Text, View
} from "react-native";

type Category = "Quran"|"Hadith"|"History"|"Creed"|"Manhaj"|"Fiqh"|"Sharia";
type Article = {
  id: string;
  category: Category;
  title: string;
  author: string;
  authorAvatar?: string;
  cover: string;
  content: string;     // markdown/plain
};
type SimpleArticle = Pick<Article, "id"|"title"|"author"|"cover"|"category">;

const API = __DEV__ ? "http://192.168.18.5:4000" : "https://YOUR_API";

export default function ArticleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<Article | null>(null);
  const [related, setRelated] = useState<SimpleArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [dRes, rRes] = await Promise.all([
        fetch(`${API}/api/articles/${id}`),
        fetch(`${API}/api/articles/related?id=${id}&limit=6`)
      ]);
      const dJ = await dRes.json();
      const rJ = await rRes.json();
      setData(dJ.item); setRelated(rJ.items ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  if (loading || !data) {
    return (
      <SafeAreaView style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:"#fff" }}>
      <View style={s.header}>
        <Pressable style={s.iconBtn} onPress={() => router.back()}><Text style={s.icon}>‹</Text></Pressable>
        <Text style={s.hTitle}>Article</Text>
        <Pressable style={s.iconBtn}><Text style={s.icon}>🔖</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding:16 }}>
        <Text style={s.cat}>{data.category}</Text>
        <Text style={s.title}>{data.title}</Text>

        <View style={{ flexDirection:"row", alignItems:"center", marginTop: 10 }}>
          {data.authorAvatar ? (
            <Image source={{ uri: data.authorAvatar }} style={{ width:28, height:28, borderRadius:14, marginRight:8 }} />
          ) : <View style={{ width:28, height:28, borderRadius:14, backgroundColor:"#E5E7EB", marginRight:8 }} />}
          <Text style={s.sub}>{data.author}</Text>
        </View>

        <Image source={{ uri: data.cover }} style={s.cover} />

        {/* простой рендер параграфами */}
        {(data.content ? data.content.split(/\n\s*\n/) : []).map((p, i) => (
          <Text key={i} style={s.p}>{p.trim()}</Text>
        ))}

        <Text style={[s.section, { marginTop: 8 }]}>Related Article</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:12, paddingVertical: 10 }}>
          {related.map(a => (
            <Pressable key={a.id} onPress={() => router.replace({ pathname: "/article/[id]", params: { id: a.id } })} style={s.relCard}>
              <Image source={{ uri: a.cover }} style={s.relImg} />
              <Text numberOfLines={2} style={s.relTitle}>{a.title}</Text>
              <Text style={s.sub}>By {a.author}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:{ height:56, paddingHorizontal:12, flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  iconBtn:{ width:36, height:36, borderRadius:18, backgroundColor:"#F3F4F6", alignItems:"center", justifyContent:"center" },
  icon:{ fontSize:18 }, hTitle:{ fontSize:16, fontWeight:"700", color:"#111827" },

  cat:{ color:"#0F766E", fontWeight:"700" },
  title:{ fontSize:22, fontWeight:"800", color:"#111827", marginTop:6 },
  sub:{ color:"#6B7280" },
  cover:{ width:"100%", height:180, borderRadius:14, marginTop:14, marginBottom:8 },
  p:{ color:"#374151", lineHeight:22, marginTop:8 },

  section:{ fontSize:18, fontWeight:"700", color:"#111827" },
  relCard:{ width:220 },
  relImg:{ width:"100%", height:120, borderRadius:12 },
  relTitle:{ fontWeight:"700", color:"#111827", marginTop:6 },
});
