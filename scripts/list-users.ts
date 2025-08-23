import { db } from "../server/db";
import { users } from "../shared/schema";

async function main() {
  const result = await db.select().from(users);
  console.log("🧑‍💻 USERS:");
  console.table(result);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ ERROR:", err);
  process.exit(1);
});
