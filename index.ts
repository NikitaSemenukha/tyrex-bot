import { Telegraf, Markup, Context, session } from "telegraf";
import * as dotenv from "dotenv";
import express from "express";

// ==================================================
// 1. КОНФИГУРАЦИЯ
// ==================================================
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CONSULTANT_CHAT_ID = process.env.CONSULTANT_ID;
const PORT = process.env.PORT || 3000; 

if (!BOT_TOKEN) {
    console.error("❌ ОШИБКА: Не указан BOT_TOKEN в файле .env");
    process.exit(1);
}

// ==================================================
// 2. СЛОВАРЬ ЛОКАЛИЗАЦИИ
// ==================================================
type Lang = 'ru' | 'ua' | 'en';

const locales: Record<Lang, any> = {
    ru: {
        // Меню и кнопки
        menu_about: "ℹ️ О нас / Презентация",
        menu_apply: "📝 Оставить заявку",
        menu_lang: "🌐 Язык / Language",
        
        // Тексты
        welcome: "Добро пожаловать в TYREX.\nВыберите действие в меню ниже:",
        
        // Имиджевый текст (Презентация)
        about_text: 
            "<b>⬛️ Инвестиционная методология TYREX</b>\n\n" +
            "Профессиональное управление капиталом через API суб-аккаунты на биржах уровня Top-Tier (Binance, Bybit, Gate) <b>без передачи средств третьим лицам</b>.\n\n" +
            "⚙️ <b>Инструменты:</b>\n" +
            "Синергия стратегий <b>Dual Investment</b> (бивалютные инвестиции) + <b>Grid</b> (сеточная торговля).\n\n" +
            "🎯 <b>Финансовая цель:</b>\n" +
            "Ориентир доходности — <b>45% годовых в валюте</b> (USDT).\n\n" +
            "🛡 <b>Безопасность и Прозрачность:</b>\n" +
            "Клиент сохраняет полный контроль над активами. Вы видите каждую сделку в реальном времени на своем биржевом аккаунте. Мы управляем — вы контролируете.",
        
        lang_select: "Выберите язык / Choose language / Оберіть мову:",
        lang_changed: "✅ Язык изменен на Русский.",
        
        // Анкета
        survey_start: "Ответьте на 2 вопроса, чтобы мы понимали ваш опыт.",
        q1: "1. Пользовались ли вы когда-нибудь USDT?",
        q2_exp: "2. Давно ли вы знакомы с рынком криптовалюты?",
        q2_int: "2. Интересует ли вас разобраться, как заработать и не прогореть на криптовалюте?",
        final: "<b>Спасибо! Ваша анкета принята.</b>\n\nКонсультант свяжется с вами в ближайшее время для обсуждения деталей подключения.",
        
        // Ответы
        btn_yes: "Да",
        btn_no: "Нет",
        btn_exp_1: "Меньше года",
        btn_exp_3: "Больше 3 лет",
        btn_exp_5: "Больше 5 лет",
        
        // Отчет менеджеру
        report_title: "НОВАЯ ЗАЯВКА",
    },
    ua: {
        menu_about: "ℹ️ Про нас / Презентація",
        menu_apply: "📝 Залишити заявку",
        menu_lang: "🌐 Мова / Language",
        
        welcome: "Ласкаво просимо в TYREX.\nОберіть дію в меню нижче:",
        
        about_text: 
            "<b>⬛️ Інвестиційна методологія TYREX</b>\n\n" +
            "Професійне управління капіталом через API суб-акаунти на біржах рівня Top-Tier (Binance, Bybit, Gate) <b>без передачі коштів третім особам</b>.\n\n" +
            "⚙️ <b>Інструменти:</b>\n" +
            "Синергія стратегій <b>Dual Investment</b> (бівалютні інвестиції) + <b>Grid</b> (сіткова торгівля).\n\n" +
            "🎯 <b>Фінансова ціль:</b>\n" +
            "Орієнтир прибутковості — <b>45% річних у валюті</b> (USDT).\n\n" +
            "🛡 <b>Безпека та Прозорість:</b>\n" +
            "Клієнт зберігає повний контроль над активами. Ви бачите кожну угоду в реальному часі на своєму біржовому акаунті. Ми керуємо — ви контролюєте.",
        
        lang_select: "Оберіть мову:",
        lang_changed: "✅ Мову змінено на Українську.",
        
        survey_start: "Дайте відповідь на 2 запитання, щоб ми розуміли ваш досвід.",
        q1: "1. Чи користувалися ви коли-небудь USDT?",
        q2_exp: "2. Чи давно ви знайомі з ринком криптовалюти?",
        q2_int: "2. Чи цікавить вас розібратися, як заробити і не прогоріти на криптовалюті?",
        final: "<b>Дякуємо! Ваша анкета прийнята.</b>\n\nКонсультант зв'яжеться з вами найближчим часом для обговорення деталей підключення.",
        
        btn_yes: "Так",
        btn_no: "Ні",
        btn_exp_1: "Менше року",
        btn_exp_3: "Більше 3 років",
        btn_exp_5: "Більше 5 років",

        report_title: "НОВА ЗАЯВКА",
    },
    en: {
        menu_about: "ℹ️ About Us / Presentation",
        menu_apply: "📝 Apply Now",
        menu_lang: "🌐 Language",
        
        welcome: "Welcome to TYREX.\nChoose an action below:",
        
        about_text: 
            "<b>⬛️ TYREX Investment Methodology</b>\n\n" +
            "Professional capital management via API sub-accounts on Top-Tier exchanges (Binance, Bybit, Gate) <b>without transferring funds to third parties</b>.\n\n" +
            "⚙️ <b>Tools:</b>\n" +
            "Synergy of <b>Dual Investment</b> + <b>Grid</b> trading strategies.\n\n" +
            "🎯 <b>Target:</b>\n" +
            "Target yield — <b>45% APY in currency</b> (USDT).\n\n" +
            "🛡 <b>Security & Transparency:</b>\n" +
            "The client retains full control over assets. You see every trade in real-time on your exchange account. We manage — you control.",
        
        lang_select: "Choose language:",
        lang_changed: "✅ Language changed to English.",
        
        survey_start: "Answer 2 questions so we can understand your experience.",
        q1: "1. Have you ever used USDT?",
        q2_exp: "2. How long have you been familiar with the crypto market?",
        q2_int: "2. Are you interested in learning how to earn on crypto safely?",
        final: "<b>Thank you! Your application has been received.</b>\n\nA consultant will contact you shortly to discuss connection details.",
        
        btn_yes: "Yes",
        btn_no: "No",
        btn_exp_1: "Less than a year",
        btn_exp_3: "More than 3 years",
        btn_exp_5: "More than 5 years",

        report_title: "NEW LEAD",
    }
};

// ==================================================
// 3. ТИПЫ ДАННЫХ И СЕССИЯ
// ==================================================
interface SessionData {
    language: Lang;
    step: 'idle' | 'language_select' | 'q1' | 'q2_exp' | 'q2_int';
    answers: {
        usdt?: string;
        details?: string; // Содержит либо Опыт, либо Интерес
    };
}

interface MyContext extends Context {
    session: SessionData;
}

// ==================================================
// 4. ИНИЦИАЛИЗАЦИЯ
// ==================================================
const bot = new Telegraf<MyContext>(BOT_TOKEN);
bot.use(session());

// Middleware: Установка начальных значений сессии
bot.use((ctx, next) => {
    if (!ctx.session) {
        ctx.session = { language: 'ru', step: 'idle', answers: {} };
    }
    return next();
});

// ==================================================
// 5. ХЕЛПЕРЫ
// ==================================================

// Получить текст на текущем языке
const t = (ctx: MyContext, key: string) => {
    const lang = ctx.session.language || 'ru';
    return locales[lang][key] || key;
};

// Получить Главное меню (Бургер внизу)
const getMainMenu = (ctx: MyContext) => {
    return Markup.keyboard([
        [t(ctx, 'menu_apply')],
        [t(ctx, 'menu_about'), t(ctx, 'menu_lang')]
    ]).resize();
};

// Настройка синей кнопки "Меню" (Commands Menu)
async function setupCommands() {
    // Дефолт (EN)
    await bot.telegram.setMyCommands([
        { command: "start", description: "🏠 Main Menu / Restart" },
        { command: "about", description: "ℹ️ About Us" },
        { command: "lang",  description: "🌐 Change Language" }
    ]);

    // Русский
    await bot.telegram.setMyCommands([
        { command: "start", description: "🏠 Главное меню / Рестарт" },
        { command: "about", description: "ℹ️ О нас / Презентация" },
        { command: "lang",  description: "🌐 Сменить язык" }
    ], { language_code: "ru" });

    // Украинский
    await bot.telegram.setMyCommands([
        { command: "start", description: "🏠 Головне меню" },
        { command: "about", description: "ℹ️ Про нас / Презентація" },
        { command: "lang",  description: "🌐 Змінити мову" }
    ], { language_code: "uk" });
}

// ==================================================
// 6. ОБРАБОТЧИКИ КОМАНД
// ==================================================

bot.command("start", async (ctx) => {
    ctx.session.step = 'idle';
    await ctx.reply(t(ctx, 'welcome'), getMainMenu(ctx));
});

bot.command("about", async (ctx) => {
    ctx.session.step = 'idle';
    await ctx.replyWithHTML(t(ctx, 'about_text'), getMainMenu(ctx));
});

bot.command("lang", async (ctx) => {
    ctx.session.step = 'language_select';
    await ctx.reply(t(ctx, 'lang_select'), Markup.keyboard([
        ["🇷🇺 Русский", "🇺🇦 Українська"],
        ["🇬🇧 English", "🔙 Back"]
    ]).resize());
});

// ==================================================
// 7. ЛОГИКА АНКЕТЫ И МЕНЮ (Обработка текста)
// ==================================================
bot.on("text", async (ctx) => {
    const text = ctx.message.text;
    const step = ctx.session.step;
    const lang = ctx.session.language;
    const l = locales[lang];

    // --- ПРОВЕРКА ГЛОБАЛЬНОГО МЕНЮ ---
    // Проверяем кнопки на всех языках, чтобы меню работало всегда, даже если язык сменился
    const isMenuAbout = [locales.ru.menu_about, locales.ua.menu_about, locales.en.menu_about].includes(text);
    const isMenuLang = [locales.ru.menu_lang, locales.ua.menu_lang, locales.en.menu_lang].includes(text);
    const isMenuApply = [locales.ru.menu_apply, locales.ua.menu_apply, locales.en.menu_apply].includes(text);

    if (isMenuAbout) {
        ctx.session.step = 'idle';
        await ctx.replyWithHTML(t(ctx, 'about_text'), getMainMenu(ctx));
        return;
    }

    if (isMenuLang) {
        ctx.session.step = 'language_select';
        await ctx.reply(t(ctx, 'lang_select'), Markup.keyboard([
            ["🇷🇺 Русский", "🇺🇦 Українська"],
            ["🇬🇧 English", "🔙 Back"]
        ]).resize());
        return;
    }

    if (isMenuApply) {
        ctx.session.step = 'q1';
        await ctx.reply(t(ctx, 'survey_start'));
        await ctx.reply(t(ctx, 'q1'), Markup.keyboard([
            [l.btn_yes, l.btn_no],
            [t(ctx, 'menu_about')] // Кнопка "Назад"
        ]).resize().oneTime());
        return;
    }

    // --- ЛОГИКА ШАГОВ АНКЕТЫ ---

    // 1. Выбор языка
    if (step === 'language_select') {
        if (text.includes("Русский")) ctx.session.language = 'ru';
        else if (text.includes("Українська")) ctx.session.language = 'ua';
        else if (text.includes("English")) ctx.session.language = 'en';
        
        // Если нажали Back или что-то другое - просто выходим
        ctx.session.step = 'idle';
        
        // Пересоздаем меню уже на новом языке
        await ctx.reply(t(ctx, 'lang_changed'), getMainMenu(ctx));
        return;
    }

    // 2. Вопрос 1 (USDT)
    if (step === 'q1') {
        // Если нажали кнопку отмены (О нас)
        if (text === l.menu_about) {
            ctx.session.step = 'idle';
            await ctx.replyWithHTML(t(ctx, 'about_text'), getMainMenu(ctx));
            return;
        }

        ctx.session.answers.usdt = text;

        if (text === l.btn_yes) {
            // Ветка: Опытный
            ctx.session.step = 'q2_exp';
            await ctx.reply(t(ctx, 'q2_exp'), Markup.keyboard([
                [l.btn_exp_1],
                [l.btn_exp_3],
                [l.btn_exp_5]
            ]).resize().oneTime());
        } else if (text === l.btn_no) {
            // Ветка: Новичок
            ctx.session.step = 'q2_int';
            await ctx.reply(t(ctx, 'q2_int'), Markup.keyboard([
                [l.btn_yes, l.btn_no]
            ]).resize().oneTime());
        } else {
            // Если ввели что-то не то
            await ctx.reply(t(ctx, 'q1')); 
        }
        return;
    }

    // 3. Вопрос 2 (Опыт)
    if (step === 'q2_exp') {
        ctx.session.answers.details = text;
        await finishSurvey(ctx);
        return;
    }

    // 4. Вопрос 2 (Интерес)
    if (step === 'q2_int') {
        ctx.session.answers.details = text;
        await finishSurvey(ctx);
        return;
    }
});

// ==================================================
// 8. ФУНКЦИЯ ЗАВЕРШЕНИЯ И ОТПРАВКИ ОТЧЕТА
// ==================================================
async function finishSurvey(ctx: MyContext) {
    const lang = ctx.session.language;
    const l = locales[lang];
    const a = ctx.session.answers;
    const user = ctx.from;

    if (!user) return;

    ctx.session.step = 'idle';

    // --- РЕШЕНИЕ ПРОБЛЕМЫ СО СКРЫТЫМИ НИКАМИ ---
    const userLink = user.username 
        ? `@${user.username}` 
        : `<a href="tg://user?id=${user.id}">${user.first_name}</a>`;

    // Формируем красивый отчет для менеджера
    const report = 
        `📊 <b>${l.report_title} (${lang.toUpperCase()})</b>\n\n` +
        `👤 <b>User:</b> ${userLink}\n` +
        `🆔 <b>ID:</b> <code>${user.id}</code>\n` +
        `🔹 <b>USDT:</b> ${a.usdt}\n` +
        `📝 <b>Info:</b> ${a.details}\n` +
        `#tyrex #lead`;

    // Отправляем менеджеру
    if (CONSULTANT_CHAT_ID) {
        try {
            await ctx.telegram.sendMessage(CONSULTANT_CHAT_ID, report, { parse_mode: "HTML" });
            // if (ctx.message) {
            //     await ctx.telegram.forwardMessage(CONSULTANT_CHAT_ID, ctx.chat.id, ctx.message.message_id);
            // }
        } catch (e) {
            console.error("Ошибка отправки заявки:", e);
        }
    }

    await ctx.replyWithHTML(l.final, getMainMenu(ctx));
}

// ==================================================
// 9. ЗАПУСК ДЛЯ RENDER.COM
// ==================================================

// А. Настройка команд Телеграм
setupCommands()
    .then(() => console.log("✅ Меню команд настроено"))
    .catch(console.error);

if (!CONSULTANT_CHAT_ID) console.error("⚠️ ПРЕДУПРЕЖДЕНИЕ: Не указан ID консультанта в .env");

// Б. Запуск бота (Polling)
bot.launch().then(() => {
    console.log("🚀 TYREX Bot успешно запущен...");
});

// В. Запуск веб-сервера (Чтобы Render не убил процесс)
const app = express();

app.get('/', (req, res) => {
    res.send('Tyrex Bot is running!');
});

app.listen(PORT, () => {
    console.log(`🌍 Web server listening on port ${PORT}`);
});


// Обработка остановки
const stop = () => {
    bot.stop();
    process.exit();
};
process.once('SIGINT', stop);
process.once('SIGTERM', stop);