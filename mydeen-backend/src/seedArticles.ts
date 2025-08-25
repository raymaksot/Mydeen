import mongoose from "mongoose";
import Article from "./models/Article";

// Прямая строка подключения без .env
// При необходимости поменяйте имя БД или креды
const uri = "mongodb://127.0.0.1:27017/mydeen"; // <-- измените при необходимости

const LIPSUM = (t: string) =>
`${t}

Islamic art and architecture are among the most impressive and visually striking artistic traditions in the world. Spanning centuries and encompassing diverse regions and cultures, Islamic art has left an indelible mark...

The Importance of Beauty in Islamic Art:
Islamic art is based on the teachings of the Quran and the Hadith, which emphasize the importance of beauty and harmony in all aspects of life. Islamic artists use mathematical precision to create complex patterns and designs...

The Significance of Islamic Architecture:
Islamic architecture is notable for its use of arches, domes, and minarets. These architectural elements hold deep symbolic meaning...`;

const data = [
  {
    category: "History",
    title: "The Beauty of Islamic Art and Architecture",
    author: "Sarina Ahmad",
    authorAvatar: "https://i.pravatar.cc/100?img=15",
    cover: "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Islamic art and architecture are among the most impressive and visually striking traditions.",
    content: LIPSUM("The Beauty of Islamic Art and Architecture"),
    tags: ["history","art","architecture"],
  },
  {
    category: "Quran",
    title: "Summary of During Ramadan Fasting Fiqh",
    author: "Sarina Ahmad",
    cover: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Key rulings and wisdom behind fasting in Ramadan.",
    content: LIPSUM("During Ramadan Fasting Fiqh"),
    tags: ["quran","fiqh","ramadan"],
  },
  {
    category: "Fiqh",
    title: "Fasting, but Remaining Disobedient",
    author: "Muhammad Idris",
    cover: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200&auto=format&fit=crop",
    excerpt: "On the inner dimensions of worship and consistency.",
    content: LIPSUM("Fasting, but Remaining Disobedient"),
    tags: ["fiqh","ethics"],
  },
  {
    category: "Hadith",
    title: "Q&A with Shaykh Abbas on Selected Hadith",
    author: "Muhammad Abbas",
    cover: "https://images.unsplash.com/photo-1549572189-ff3b7d3f95bb?q=80&w=1200&auto=format&fit=crop",
    excerpt: "A practical look at selected narrations.",
    content: LIPSUM("Selected Hadith"),
    tags: ["hadith","q&a"],
  },
  {
    category: "Creed",
    title: "Pillars of Faith Explained",
    author: "Abu Yusuf",
    cover: "https://images.unsplash.com/photo-1520975922284-8b456906c813?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Foundations of Islamic creed for new students.",
    content: LIPSUM("Pillars of Faith"),
    tags: ["creed","aqeedah"],
  },
  {
    category: "Manhaj",
    title: "Methodology of Seeking Knowledge",
    author: "Umm Salamah",
    cover: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Balanced approach to learning and practice.",
    content: LIPSUM("Methodology of Seeking Knowledge"),
    tags: ["manhaj","study"],
  },
  {
    category: "Sharia",
    title: "Objectives of Sharia (Maqasid)",
    author: "Nawfal Karim",
    cover: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Higher intents of Islamic law.",
    content: LIPSUM("Objectives of Sharia (Maqasid)"),
    tags: ["sharia","maqasid","law"],
  },
];

(async () => {
  await mongoose.connect(uri);
  console.log("Mongo connected");
  await Article.deleteMany({});
  const inserted = await Article.insertMany(data);
  console.log(`Seeded: ${inserted.length} articles`);
  await mongoose.disconnect();
  process.exit(0);
})();
