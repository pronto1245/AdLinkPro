import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());     // Для чтения JSON в body
app.use(authRouter);         // Подключаем маршруты /api/auth/*

app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});

