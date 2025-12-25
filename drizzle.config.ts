import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
    throw new Error("DATABASE_URL or DATABASE_AUTH_TOKEN is not defined");
}

export default defineConfig({
    dialect: "turso",
    schema: "./lib/db/schema.ts",
    out: "./migrations",
    dbCredentials: {
        url,
        authToken
    }
});
