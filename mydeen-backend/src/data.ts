export type Category = "Quran" | "Hadith" | "History" | "Creed" | "Manhaj" | "Fiqh";

export const CATEGORIES: Category[] = ["Quran", "Hadith", "History", "Creed", "Manhaj", "Fiqh"];

export const FEATURED = [
  {
    id: "1",
    title: "Summary of During Ramadan Fasting Fiqh",
    author: "Sarina Ahmad",
    time: "15:21",
    image: "https://picsum.photos/seed/quran1/640/400",
    category: "Quran" as const
  },
  {
    id: "2",
    title: "Q&A with Shaykh Abbas",
    author: "Muhammad Abbas",
    time: "15:21",
    image: "https://picsum.photos/seed/quran2/640/400",
    category: "Quran" as const
  },
  {
    id: "3",
    title: "Fiqh of Prayer — Essentials",
    author: "Ustadh Ali",
    time: "15:21",
    image: "https://picsum.photos/seed/quran3/640/400",
    category: "Fiqh" as const
  }
];

export const LATEST = [
  {
    id: "a",
    tag: "Historical",
    title: "The World’s Muslims: Religion, Politics and Society",
    author: "Natalia Parsha",
    image: "https://picsum.photos/seed/article1/400/400"
  },
  {
    id: "b",
    tag: "Historical",
    title: "Biography of Abdullah bin Umar r.a.",
    author: "Muhammad Faqih",
    image: "https://picsum.photos/seed/article2/400/400"
  },
  {
    id: "c",
    tag: "Fiqh",
    title: "Fasting, but Remaining Disobedient",
    author: "Muhammad Idris",
    image: "https://picsum.photos/seed/article3/400/400"
  }
];

export const USERS = [
  {
    id: "u1",
    name: "Fatimah Jaber",
    avatar: "https://i.pravatar.cc/100?img=12",
    // дефолтные координаты пользователя (пример: Джакарта)
    lat: -6.200000,
    lng: 106.816666
  }
];
