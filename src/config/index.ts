import * as dotenv from "dotenv";

dotenv.config();

export const config = {
    BOT_TOKEN: process.env.BOT_TOKEN!,
    ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID, 
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 3000,
};

if (!config.BOT_TOKEN) throw new Error("❌ ОШИБКА: Нет BOT_TOKEN");
if (!config.MONGO_URI) throw new Error("❌ ОШИБКА: Нет MONGO_URI");