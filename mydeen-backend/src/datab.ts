import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/server'; // замените на ваш URI

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB подключена');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};