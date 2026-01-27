import { env } from "@lightning/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "./schema/auth";

const schema = {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
};

export const db = drizzle(env.DATABASE_URL, { schema });
