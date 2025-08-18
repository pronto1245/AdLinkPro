import bcrypt from "bcryptjs"; // Заменено bcrypt на bcryptjs
import express from 'express';
import cors from 'cors';
import { Pool } from "pg";
import rateLimit from "express-rate-limit";
import compression from "compression";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { devLoginRouter } from "./dev.login";
import { authRouter } from "./auth.routes";
import { registerDevRoutes } from "./dev-routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(compression());
app.use(helmet());

// Database pool
const pool = new Pool({
  user: 'your_database_user',
  host: 'your_database_host',
  database: 'your_database_name',
  password: 'your_database_password',
  port: 5432, // стандартный порт PostgreSQL
});

// Routes
app.use('/api/dev-login', devLoginRouter);
app.use('/api/auth', authRouter);
registerDevRoutes(app);

// Пример хэширования пароля
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Пример сравнения паролей
async function comparePasswords(inputPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

// Пример использования
async function exampleUsage() {
  const password = "examplePassword";
  const hashedPassword = await hashPassword(password);

  console.log("Hashed Password:", hashedPassword);

  const isMatch = await comparePasswords(password, hashedPassword);
  console.log("Password matches:", isMatch);
}

exampleUsage();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
