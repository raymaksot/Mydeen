# Mydeen App

## Описание
Mydeen — это приложение, содержащее статьи, видео и другие исламские ресурсы. Проект состоит из фронтенда (React Native/Expo) и бэкенда (Node.js/Express).

---

## Быстрый старт

### 1. Клонирование репозитория
```sh
git clone https://github.com/raymaksot/Mydeen.git
cd Mydeen
```

### 2. Установка зависимостей
#### Фронтенд
```sh
cd mydeen
npm install
```
#### Бэкенд
```sh
cd ../mydeen-backend
npm install
```

---

## Подключение к MongoDB

### 1. Получите строку подключения
- Зарегистрируйтесь на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) или используйте локальный MongoDB.
- Создайте кластер и получите строку подключения вида:
  ```
  mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydeen?retryWrites=true&w=majority
  ```

### 2. Настройте переменные окружения
- В папке `mydeen-backend` создайте файл `.env`:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydeen?retryWrites=true&w=majority
  PORT=3000
  ```

### 3. Использование в коде (пример)
В файле `mydeen-backend/src/db.ts`:
```ts
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || '';

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
```

---

## Запуск проекта

### Бэкенд
```sh
cd mydeen-backend
npm run start
```

### Фронтенд
```sh
cd mydeen
npx expo start
```

---

## Полезные ссылки
- [Документация MongoDB](https://www.mongodb.com/docs/)
- [Документация Mongoose](https://mongoosejs.com/docs/)
- [Expo](https://docs.expo.dev/)

---

## Контакты
- Вопросы и предложения: raymaksot@gmail.com
