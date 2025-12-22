import { Markup } from "telegraf";
import { MyContext } from "../core/types";
import { t } from "../localization";

export const getMainMenu = (ctx: MyContext) => {
    return Markup.keyboard([
        [t(ctx, 'menu_apply')],
        [t(ctx, 'menu_about'), t(ctx, 'menu_lang')]
    ]).resize();
};

export const getLangMenu = () => {
    return Markup.keyboard([
        ["🇷🇺 Русский", "🇺🇦 Українська"],
        ["🇬🇧 English", "🔙 Back"]
    ]).resize();
};