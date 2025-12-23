import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    telegramId: number;
    username?: string;
    firstName: string;
    language: string;
    survey: {
        usdt?: string;
        details?: string;
        completedAt?: Date;
    };
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    telegramId: { type: Number, required: true, unique: true },
    username: { type: String },
    firstName: { type: String },
    language: { type: String, default: 'ru' },
    survey: {
        usdt: String,
        details: String,
        completedAt: Date
    },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);