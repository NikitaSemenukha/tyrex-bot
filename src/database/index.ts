import mongoose from 'mongoose';
import { config } from '../config';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI!);
        console.log("🍃 MongoDB подключена успешно");
    } catch (error) {
        console.error("❌ Ошибка подключения к MongoDB:", error);
        process.exit(1);
    }
};