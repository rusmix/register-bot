import { Markup, Telegram } from "telegraf";

export const initialKeyboard = Markup.inlineKeyboard([
  [
    { text: "Патент", callback_data: "patent" },
    { text: "Трудоустройство", callback_data: "work" },
  ],
  [
    { text: "Прописка", callback_data: "propiska" },
    { text: "Страхование (ДМС)", callback_data: "insurance" },
  ],
  [{ text: "Адвокат (миграционный юрист)", callback_data: "advocate" }],
]);

export const countryKeyboard = Markup.inlineKeyboard([
  [
    { text: "Таджикистан", callback_data: "tadjikistan" },
    { text: "Узбекистан", callback_data: "uzbekistan" },
  ],
]);

export const regionKeyboard = Markup.inlineKeyboard([
  [
    { text: "Санкт-Петербург", callback_data: "spb" },
    { text: "Ленинградская область", callback_data: "spb_region" },
  ],
]);

export const phoneKeyboard = Markup.keyboard([
  [{ text: "Отправить номер телефона", request_contact: true }],
]).resize();
