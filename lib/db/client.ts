import { drizzle } from 'drizzle-orm/libsql/web';

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken ){
    throw new Error("DATABASE_URL or DATABASE_AUTH_TOKEN is not defined");
}

export const db = drizzle({
    connection: {
        url,
        authToken,
    }
});

