import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** ПАЛИТРА */
const C = {
  green: "#0F766E", // emerald-700
  greenDark: "#0B4E48",
  bg: "#ffffff",
  text: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  chip: "#F3F4F6",
  cardDark: "#0f1f1e",
};

// Интерфейсы backend-контракта
export interface HomeUser {
  id: string;
  name?: string;
  avatar?: string;
}

export interface NextPrayer {
  name: 'Fajr'|'Sunrise'|'Dhuhr'|'Asr'|'Maghrib'|'Isha';
  iso: string;
  hhmm: string;
  ampm: string;
}

export interface QiblaInfo {
  bearing: number;
}

export interface ArticleLike {
  id: string;
  title: string;
  image?: string;
  summary?: string;
}

export interface HomeResponse {
  user: HomeUser;
  nextPrayer: NextPrayer;
  qibla: QiblaInfo;
  categories: string[];
  featured: ArticleLike[];
  latest: ArticleLike[];
}

// Кэш через переменную (можно заменить на Zustand/Redux)
let lastHomeCache: HomeResponse | null = null;

// Функция загрузки данных
export async function loadHome(params?: { userId?: string; lat?: number; lng?: number }): Promise<HomeResponse> {
  let url = 'http://192.168.18.5:4000/api/home';
  if (params) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) usp.append(k, String(v));
    });
    url += '?' + usp.toString();
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка загрузки домашнего экрана');
  const data = await res.json();
  lastHomeCache = data;
  return data;
}

function formatLocalTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const placeholderAvatar = 'https://ui-avatars.com/api/?name=User';

/** МАЛЕНЬКИЕ КОМПОНЕНТЫ */
const SectionHeader = ({ title, onSeeAll, category }: { title: string; onSeeAll?: () => void; category?: string }) => {
  const router = useRouter();
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Pressable
        onPress={() => {
          if (category) {
            router.push(`../cult-videos?category=${encodeURIComponent(category)}`);
          } else if (onSeeAll) {
            onSeeAll();
          }
        }}
      >
        <Text style={{ color: "#0F766E", fontWeight: "700" }}>See All</Text>
      </Pressable>
    </View>
  );
};

const ChipTabs = ({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
    <View style={{ flexDirection: "row", gap: 16 }}>
      {items.map((it) => {
        const active = it === value;
        return (
          <Pressable key={it} onPress={() => onChange(it)} style={{ paddingBottom: 8 }}>
            <Text style={[s.chipText, active && { color: C.green }]}>{it}</Text>
            <View style={[s.chipUnderline, active && { backgroundColor: C.green }]} />
          </Pressable>
        );
      })}
    </View>
  </ScrollView>
);

const FeaturedCard = ({ item }: { item: ArticleLike }) => (
  <View style={s.featuredCard}>
    {item.image && <Image source={{ uri: item.image }} style={s.featuredImg} />}
    <View style={s.timeBadge}>
      {/* Если есть summary, показываем её как "time" */}
      <Text style={s.timeText}>{item.summary || ''}</Text>
    </View>
    <View style={{ marginTop: 10 }}>
      <Text numberOfLines={2} style={s.cardTitle}>
        {item.title}
      </Text>
    </View>
  </View>
);

const ArticleRow = ({ item }: { item: ArticleLike }) => (
  <View style={s.articleRow}>
    {item.image && <Image source={{ uri: item.image }} style={s.articleImg} />}
    <View style={{ flex: 1 }}>
      {/* tag не входит в контракт, поэтому не отображаем */}
      <Text numberOfLines={2} style={s.articleTitle}>
        {item.title}
      </Text>
      {item.summary && <Text style={s.cardSub}>{item.summary}</Text>}
    </View>
  </View>
);

/** ОСНОВНОЙ ЭКРАН */
export default function HomeScreen() {
  const [data, setData] = useState<HomeResponse | null>(lastHomeCache);
  const [loading, setLoading] = useState(!lastHomeCache);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    loadHome()
      .then((resp) => {
        if (mounted) {
          setData(resp);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (mounted) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}><Text>Загрузка...</Text></View>;
  }
  if (error) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}><Text style={{ color: 'red' }}>Ошибка: {error}</Text></View>;
  }
  if (!data) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}><Text>Нет данных</Text></View>;
  }

  const { user, nextPrayer, qibla, categories, featured, latest } = data;
  const cat = selectedCategory || categories[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Шапка с фоном */}
        <View>
          <ImageBackground
            source={{ uri: "https://picsum.photos/seed/skyline/800/500" }}
            style={s.headerBg}
            imageStyle={{ opacity: 0.55 }}
          >
            <View style={s.headerOverlay} />
            <View style={s.headerPadding}>
              {/* Верхняя строка */}
              <View style={s.headerTopRow}>
                <View>
                  <Text style={s.greetSmall}>Ассаламу алейкум</Text>
                  <Text style={s.greetName}>{user.name || 'Гость'}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Pressable style={s.iconBtn}>
                    <Text style={{ color: "#fff" }}>🔔</Text>
                  </Pressable>
                  <Image
                    source={{ uri: user.avatar || placeholderAvatar }}
                    style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: "rgba(255,255,255,0.8)" }}
                  />
                </View>
              </View>

              {/* Карточка следующей молитвы */}
              <View style={s.prayerCard}>
                <View>
                  <Text style={{ color: "#C7D2D9" }}>Следующая молитва: {nextPrayer.name}</Text>
                  <Text style={s.prayerTime}>{formatLocalTime(nextPrayer.iso)}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: C.text, fontWeight: "700", marginBottom: 4 }}>Кибла</Text>
                  <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{
                      width: 0,
                      height: 0,
                      borderLeftWidth: 8,
                      borderRightWidth: 8,
                      borderBottomWidth: 18,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderBottomColor: '#007AFF',
                      transform: [{ rotate: `${qibla.bearing}deg` }],
                    }} />
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Секции */}
        <View style={s.content}>
          <SectionHeader title="Featured" category={cat} />
          <ChipTabs items={categories} value={cat} onChange={setSelectedCategory} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featured}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingVertical: 12, paddingRight: 16 }}
            renderItem={({ item }) => <FeaturedCard item={item} />}
          />
            <SectionHeader title="Latest" onSeeAll={() => router.push("/articles")} />
          <View style={{ marginTop: 6, gap: 14 }}>
            {latest.map((it) => (
              <ArticleRow key={it.id} item={it} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** СТИЛИ */
const s = StyleSheet.create({
  headerBg: {
    height: 260,
    justifyContent: "flex-end",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,30,28,0.55)",
  },
  headerPadding: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greetSmall: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  greetName: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 2 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  prayerCard: {
    marginTop: 16,
    backgroundColor: C.cardDark,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prayerTime: { color: "#fff", fontSize: 36, fontWeight: "800", marginTop: 6, letterSpacing: 0.5 },
  qiblaBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  sectionHeader: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  seeAll: { color: C.green, fontWeight: "700" },

  chipText: { fontSize: 14, color: "#6B7280", fontWeight: "700" },
  chipUnderline: { marginTop: 8, height: 3, borderRadius: 999, backgroundColor: "transparent" },

  featuredCard: {
    width: 260,
    marginRight: 16,
  },
  featuredImg: {
    width: "100%",
    height: 150,
    borderRadius: 14,
  },
  timeBadge: {
    position: "absolute",
    left: 10,
    top: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: Platform.select({ ios: 4, android: 2 }),
  },
  timeText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  cardTitle: { color: C.text, fontWeight: "700", fontSize: 15 },
  cardSub: { color: C.textMuted, marginTop: 2 },

  articleRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  articleImg: { width: 96, height: 96, borderRadius: 14 },
  articleTag: { color: C.green, fontWeight: "700", marginBottom: 4 },
  articleTitle: { color: C.text, fontWeight: "700", fontSize: 15 },
});
