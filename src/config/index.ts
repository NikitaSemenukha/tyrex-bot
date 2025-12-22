import * as dotenv from "dotenv";

dotenv.config();

export const config = {
    BOT_TOKEN: process.env.BOT_TOKEN!,
    CONSULTANT_ID: process.env.CONSULTANT_ID,
    PORT: process.env.PORT || 3000,
};