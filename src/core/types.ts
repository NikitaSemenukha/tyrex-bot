import { Context, Scenes } from "telegraf";

export type Lang = 'ru' | 'ua' | 'en';

export interface SurveyData {
    usdt?: string;
    details?: string;
}

interface MyWizardSession extends Scenes.WizardSessionData {
    surveyData: SurveyData;
}

interface MySession extends Scenes.WizardSession<MyWizardSession> {
    language: Lang;
}

export interface MyContext extends Context {
    session: MySession;
    scene: Scenes.SceneContextScene<MyContext, MyWizardSession>;
    wizard: Scenes.WizardContextWizard<MyContext>;
}