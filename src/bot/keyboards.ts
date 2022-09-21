import { Markup, Telegram } from "telegraf";

export const serviceKeyboard = Markup.inlineKeyboard([
  [
    { text: "Патент", callback_data: "patent" },
    { text: "Трудоустройство", callback_data: "work" },
  ],
  [
    { text: "Адвокат (миграционный юрист)", callback_data: "advocate" },
    { text: "Списать долг", callback_data: "dolg" },
  ],
  [{ text: "Другое", callback_data: "otherService" }],
]);

export const countryKeyboard = Markup.inlineKeyboard([
  [
    { text: "Таджикистан", callback_data: "tadjikistan" },
    { text: "Узбекистан", callback_data: "uzbekistan" },
  ],
  [
    { text: "Азербайджан", callback_data: "azerbaidjan" },
    { text: "Россия", callback_data: "russia" },
  ],
  [{ text: "Другое", callback_data: "otherCountry" }],
]);

export const regionKeyboard = Markup.inlineKeyboard([
  [
    { text: "Санкт-Петербург", callback_data: "spb" },
    { text: "Ленинградская область", callback_data: "spb_region" },
  ],
  [{ text: "Другой", callback_data: "otherRegion" }],
]);

export const phoneKeyboard = Markup.keyboard([
  [{ text: "Отправить номер телефона", request_contact: true }],
]).resize();
