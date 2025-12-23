// src/services/report.service.ts
import { MyContext } from "../core/types";
import { config } from "../config";
import { t } from "../localization";
import { User } from "../models/User"; // Импортируем модель

export const sendLeadReport = async (ctx: MyContext) => {
    const user = ctx.from;
    const a = ctx.scene.session.surveyData;
    const lang = ctx.session.language || 'ru';

    if (!user) return;

    // 1. СОХРАНЕНИЕ В MONGODB
    try {
        await User.findOneAndUpdate(
            { telegramId: user.id }, // Поиск по ID
            {
                telegramId: user.id,
                username: user.username,
                firstName: user.first_name,
                language: lang,
                survey: {
                    usdt: a.usdt,
                    details: a.details,
                    completedAt: new Date()
                }
            },
            { upsert: true, new: true } // Создать, если нет; вернуть обновленный
        );
        console.log(`✅ User ${user.id} saved to DB`);
    } catch (err) {
        console.error("❌ Database Error:", err);
        // Не прерываем выполнение, пробуем отправить в ТГ даже если база упала
    }

    // 2. ОТПРАВКА В ГРУППУ TELEGRAM
    if (!config.ADMIN_CHAT_ID) {
        console.warn("⚠️ ADMIN_CHAT_ID не установлен. Отчет не отправлен.");
        return;
    }

    const userLink = user.username 
        ? `@${user.username}` 
        : `<a href="tg://user?id=${user.id}">${user.first_name}</a>`;

    const report = 
        `📊 <b>${t(ctx, 'report_title')} (${lang.toUpperCase()})</b>\n\n` +
        `👤 <b>User:</b> ${userLink}\n` +
        `🆔 <b>ID:</b> <code>${user.id}</code>\n` +
        `🔹 <b>USDT:</b> ${a.usdt}\n` +
        `📝 <b>Info:</b> ${a.details}\n` +
        `📅 <b>Date:</b> ${new Date().toLocaleString('ru-RU')}\n` +
        `#tyrex #lead #new`;

    try {
        await ctx.telegram.sendMessage(config.ADMIN_CHAT_ID, report, { 
            parse_mode: "HTML",
            // Это важно для групп: отключает уведомление, если сообщение пришло ночью (опционально)
            disable_notification: false 
        });
    } catch (e) {
        console.error("❌ Telegram Send Error:", e);
    }
};