import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.js';

const pool = new pg.Pool({
  connectionString: 'postgres://<username>:<password>@<host>:<port>/<dbname>',
});

const db = drizzle(pool, { schema });

const users = await db.query.users.findMany();
console.log(users);
process.exit(0);
