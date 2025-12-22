// src/scenes/survey.scene.ts
import { Scenes, Markup } from "telegraf";
import { MyContext } from "../core/types";
import { t, locales } from "../localization";
import { getMainMenu } from "../utils/keyboards";
import { sendLeadReport } from "../services/report.service";

// Шаг 1: Спрашиваем про USDT
const step1 = async (ctx: MyContext) => {
    ctx.scene.session.surveyData = {}; // Инициализация
    const lang = ctx.session.language;
    
    await ctx.reply(t(ctx, 'survey_start'));
    await ctx.reply(t(ctx, 'q1'), Markup.keyboard([
        [locales[lang].btn_yes, locales[lang].btn_no],
        [t(ctx, 'menu_about')] // Кнопка отмены
    ]).resize().oneTime());
    
    return ctx.wizard.next();
};

// Шаг 2: Обрабатываем ответ про USDT и задаем следующий вопрос
const step2 = async (ctx: MyContext) => {
    // @ts-ignore (текст есть в message)
    const text = ctx.message?.text; 
    const lang = ctx.session.language;
    const l = locales[lang];

    // Выход из анкеты
    if (text === l.menu_about) {
        await ctx.replyWithHTML(t(ctx, 'about_text'), getMainMenu(ctx));
        return ctx.scene.leave();
    }

    ctx.scene.session.surveyData.usdt = text;

    if (text === l.btn_yes) {
        // Ветка "Опытный"
        await ctx.reply(t(ctx, 'q2_exp'), Markup.keyboard([
            [l.btn_exp_1], [l.btn_exp_3], [l.btn_exp_5]
        ]).resize().oneTime());
        // Мы используем тот же шаг обработки, но контекст вопроса другой
        return ctx.wizard.next();
    } else {
        // Ветка "Новичок"
        await ctx.reply(t(ctx, 'q2_int'), Markup.keyboard([
            [l.btn_yes, l.btn_no]
        ]).resize().oneTime());
        return ctx.wizard.next();
    }
};

// Шаг 3: Финал
const step3 = async (ctx: MyContext) => {
    // @ts-ignore
    const text = ctx.message?.text;
    
    ctx.scene.session.surveyData.details = text;

    // Отправляем данные менеджеру
    await sendLeadReport(ctx);

    // Благодарим пользователя
    await ctx.replyWithHTML(t(ctx, 'final'), getMainMenu(ctx));
    return ctx.scene.leave();
};

export const surveyScene = new Scenes.WizardScene<MyContext>(
    "SURVEY_SCENE",
    step1,
    step2,
    step3
);