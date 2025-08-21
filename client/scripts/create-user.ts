import { db } from "../../src/lib/db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function main() {
  const email = "9791207@gmail.com";
  const password = "Affilix123!";
  const username = "adminAffilix";

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    console.log("⚠️ Пользователь уже существует.");
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    email,
    password: hash,
    username,
    role: "advertiser",
  });

  console.log("✅ Пользователь успешно создан.");
}

main().catch((err) => {
  console.error("❌ Ошибка:", err);
  process.exit(1);
});
