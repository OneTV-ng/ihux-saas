import "dotenv/config";
import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
// You can specify any property from the mysql2 connection options
const db = drizzle({ connection: { uri: process.env.DATABASE_URL }});

import { defineConfig } from "drizzle-kit";
import * as accountSchema from "./schema/account.schema";
import * as usersSchema from "./schema/user.schema";
import * as adminSchema from "./schema/admin.schema";
//import * as sessionSchema from "./schema/session.schema";
import * as verificationSchema from "./schema/verification.schema";
import * as songSchema from "./schema/song.schema";
import * as adminTaskSchema from "./schema/admin-task.schema";
import * as royaltySchema from "./schema/royalty.schema";
import * as uploadSchema from "./schema/upload.schema";
import * as emailLogSchema from "./schema/email-log.schema";
import * as notificationSchema from "./schema/notification.schema";
import * as artistsSchema from "./schema/artist.schema";
// Add more as needed
export * from "./schema/index";
import { NORMALIZED_DIALECT } from "./dialect";
import { artists } from "./schema/artist.schema";

const { drizzle } = require("drizzle-orm/mysql2");
const mysql = require("mysql2/promise");
const pool = mysql.createPool(process.env.DATABASE_URL!);
const db = drizzle(pool, {
  schema: {
    ...accountSchema,
    ...usersSchema,
    ...artistsSchema,
    ...songSchema,
    ...adminTaskSchema,
    ...royaltySchema,
    ...uploadSchema,
    ...emailLogSchema,
    ...notificationSchema,
    ...verificationSchema,
    ...adminSchema,
  },
  mode: "default",
});

export {  db };
