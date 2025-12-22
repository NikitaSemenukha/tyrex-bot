// src/services/report.service.ts
import { MyContext } from "../core/types";
import { config } from "../config";
import { t } from "../localization";

export const sendLeadReport = async (ctx: MyContext) => {
    if (!config.CONSULTANT_ID) return;

    const user = ctx.from;
    const a = ctx.scene.session.surveyData;
    const lang = ctx.session.language || 'ru';

    if (!user) return;

    const userLink = user.username 
        ? `@${user.username}` 
        : `<a href="tg://user?id=${user.id}">${user.first_name}</a>`;

    const report = 
        `📊 <b>${t(ctx, 'report_title')} (${lang.toUpperCase()})</b>\n\n` +
        `👤 <b>User:</b> ${userLink}\n` +
        `🆔 <b>ID:</b> <code>${user.id}</code>\n` +
        `🔹 <b>USDT:</b> ${a.usdt}\n` +
        `📝 <b>Info:</b> ${a.details}\n` +
        `#tyrex #lead`;

    try {
        await ctx.telegram.sendMessage(config.CONSULTANT_ID, report, { parse_mode: "HTML" });
    } catch (e) {
        console.error("Ошибка отправки репорта:", e);
    }
};