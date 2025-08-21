import { db } from "../../src/lib/db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  const result = await db.select().from(users).where(eq(users.email, "9791207@gmail.com"));
  if (result.length === 0) {
    console.log("❌ Пользователь не найден.");
  } else {
    console.log("✅ Пользователь найден:");
    console.log(result);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Ошибка:", err);
  process.exit(1);
});
