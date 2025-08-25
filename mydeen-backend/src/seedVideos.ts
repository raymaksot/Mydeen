import mongoose from "mongoose";
import Video from "./models/Video";

const MONGO_URI = "mongodb://localhost:27017/server"; // замените на ваш URI

async function seed() {
  await mongoose.connect(MONGO_URI);

  const videos = [
    {
      youtubeId: "dQw4w9WgXcQ",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Example Video 1",
      channel: "Channel One",
      durationSec: 210,
      category: "Quran",
      tags: ["islam", "quran"],
      publishedAt: new Date("2023-01-01"),
      viewCount: 100,
      likeCount: 10,
    },
    {
      youtubeId: "eY52Zsg-KVI",
      url: "https://www.youtube.com/watch?v=eY52Zsg-KVI",
      title: "Example Video 2",
      channel: "Channel Two",
      durationSec: 180,
      category: "Hadith",
      tags: ["hadith", "education"],
      publishedAt: new Date("2023-02-01"),
      viewCount: 200,
      likeCount: 20,
    },
  ];

  await Video.insertMany(videos);
  console.log("Данные успешно добавлены!");
  await mongoose.disconnect();
}

seed();