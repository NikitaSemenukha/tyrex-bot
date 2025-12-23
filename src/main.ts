// src/main.ts
import { Telegraf, Scenes, session } from "telegraf";
import express from "express";
import { config } from "./config";
import { MyContext } from "./core/types";
import { t, locales } from "./localization";
import { getMainMenu, getLangMenu } from "./utils/keyboards";
import { surveyScene } from "./scenes/survey.scene";
import { connectDB } from "./database"; // <--- Импорт

// 1. Инициализация
const bot = new Telegraf<MyContext>(config.BOT_TOKEN);
const stage = new Scenes.Stage<MyContext>([surveyScene]);

bot.use(session());
bot.use(stage.middleware());

// Middleware инициализации языка
bot.use((ctx, next) => {
    if (!ctx.session) {
        // @ts-ignore
        ctx.session = {}; 
    }
    if (!ctx.session.language) ctx.session.language = 'ru';
    return next();
});

// 2. Команды
bot.command("start", async (ctx) => {
    await ctx.reply(t(ctx, 'welcome'), getMainMenu(ctx));
});

bot.command("about", async (ctx) => {
    await ctx.replyWithHTML(t(ctx, 'about_text'), getMainMenu(ctx));
});

bot.command("lang", async (ctx) => {
    await ctx.reply(t(ctx, 'lang_select'), getLangMenu());
});

// 3. Обработка Текста (Меню)
bot.on("text", async (ctx) => {
    const text = ctx.message.text;
    const lang = ctx.session.language;
    
    // Проверка глобальных кнопок (работает на любом языке)
    const isApply = Object.values(locales).some((l: any) => l.menu_apply === text);
    const isAbout = Object.values(locales).some((l: any) => l.menu_about === text);
    const isLang = Object.values(locales).some((l: any) => l.menu_lang === text);
    const isBack = text.includes("Back") || text.includes("Назад");

    if (isApply) {
        // ВХОД В СЦЕНУ
        await ctx.scene.enter("SURVEY_SCENE");
    } 
    else if (isAbout) {
        await ctx.replyWithHTML(t(ctx, 'about_text'), getMainMenu(ctx));
    }
    else if (isLang) {
        await ctx.reply(t(ctx, 'lang_select'), getLangMenu());
    }
    // Обработка выбора языка
    else if (text.includes("Русский")) {
        ctx.session.language = 'ru';
        await ctx.reply(t(ctx, 'lang_changed'), getMainMenu(ctx));
    }
    else if (text.includes("Українська")) {
        ctx.session.language = 'ua';
        await ctx.reply(t(ctx, 'lang_changed'), getMainMenu(ctx));
    }
    else if (text.includes("English")) {
        ctx.session.language = 'en';
        await ctx.reply(t(ctx, 'lang_changed'), getMainMenu(ctx));
    }
    else if (isBack) {
        await ctx.reply(t(ctx, 'welcome'), getMainMenu(ctx));
    }
});

const startApp = async () => {
    await connectDB();

    const app = express();
    app.get('/', (req, res) => res.send('Tyrex Bot with Mongo is Running'));
    app.listen(config.PORT, () => console.log(`🌍 Server on port ${config.PORT}`));

    bot.launch().then(() => console.log("🚀 Bot started"));
};

startApp();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));