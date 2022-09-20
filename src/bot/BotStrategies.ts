// import "module-alias/register";
import { Telegraf, Context, Types, Markup } from "telegraf";
import "dotenv/config";
import { Update, Message, User } from "typegram";
import { Config as config } from "./config";
import { Emails, State } from "./Email";
const nodemailer = require("nodemailer");
const needle = require("needle");
const fs = require("fs");

import {
  countryKeyboard,
  phoneKeyboard,
  regionKeyboard,
  serviceKeyboard,
} from "./keyboards";
// import { russian, tadjik, uzbek } from "./texts";
import { ELanguage, LanguagesJsonParser } from "./jsonParser";

type BaseMessage = Update.New &
  Update.NonChannel &
  Message & {
    text?: string;
    forward_from?: User;
    voice?: unknown;
    sticker?: unknown;
    document?: TgAsset;
    photo?: unknown[];
    caption: string;
    contact?: { phone_number: unknown };
  };

type TgMessage = BaseMessage & {
  reply_to_message?: BaseMessage;
};

type TgAsset = {
  file_id: string;
};

export class BotStrategies {
  private languagesJsonParser = new LanguagesJsonParser(
    __dirname.split("/").slice(0, -2).join("/") + "/src/bot/texts.json"
  );
  constructor(private readonly bot: Telegraf<Context>) {}

  async Initialize() {
    await this.bot.telegram.setMyCommands([
      { command: "start", description: "Отправить письмо ещё раз" },
    ]);

    // await this.bot.telegram.setChatDescription("вот такмогу");
    this.bot.start((ctx: Context) => this.start(ctx));
    this.bot.hears(/\/settj1/, (ctx: Context) => {
      const text = (ctx.message as TgMessage).text
        .split(" ")
        .slice(1, -1)
        .join(" ");
      this.languagesJsonParser.set(ELanguage.TJ, text);
    });
    this.bot.hears(/\/setuz/, (ctx: Context) => {
      const text = (ctx.message as TgMessage).text
        .split(" ")
        .slice(1, -1)
        .join(" ");
      this.languagesJsonParser.set(ELanguage.UZ, text);
    });
    this.bot.hears(/\/setru1/, (ctx: Context) => {
      const text = (ctx.message as TgMessage).text
        .split(" ")
        .slice(1, -1)
        .join(" ");
      this.languagesJsonParser.set(ELanguage.RU, text);
    });
    // this.bot.hears(/\/mail1370/, (ctx: Context) => this.getClients(ctx));

    // this.clearBD();
    // this.bot.catch(console.error);
    this.bot.action("patent", async (ctx) => this.handleService(ctx, "Патент"));
    this.bot.action("work", async (ctx) => this.handleService(ctx, "Работа"));
    this.bot.action("propiska", async (ctx) =>
      this.handleService(ctx, "Прописка")
    );
    this.bot.action("insurance", async (ctx) =>
      this.handleService(ctx, "Страховка")
    );
    this.bot.action("advocate", async (ctx) =>
      this.handleService(ctx, "Адвокат")
    );
    this.bot.action("dolg", async (ctx) =>
      this.handleService(ctx, "Списать долг")
    );
    this.bot.action("otherService", async (ctx) =>
      this.handleService(ctx, "Другое")
    );

    this.bot.action("tadjikistan", async (ctx) =>
      this.handleCountry(ctx, "Таджикистан", ELanguage.TJ)
    );
    this.bot.action("uzbekistan", async (ctx) =>
      this.handleCountry(ctx, "Узбекистан", ELanguage.UZ)
    );
    this.bot.action("azerbaidjan", async (ctx) =>
      this.handleCountry(ctx, "Азербайджан", ELanguage.RU)
    );
    this.bot.action("russia", async (ctx) =>
      this.handleCountry(ctx, "Россия", ELanguage.RU)
    );
    this.bot.action("otherCountry", async (ctx) =>
      this.handleCountry(ctx, "Другая страна", ELanguage.RU)
    );

    this.bot.action("spb", async (ctx) =>
      this.handleRegion(ctx, "Санкт-Петербург")
    );
    this.bot.action("spb_region", async (ctx) =>
      this.handleRegion(ctx, "Ленинградская область")
    );
    this.bot.action("otherRegion", async (ctx) =>
      this.handleRegion(ctx, "Другой")
    );

    this.bot.on("message", (ctx: Context) => this.stateHandler(ctx));

    this.bot.catch(console.error);

    console.log("BotStrategies initialization ended.");
  }

  private async handleCountry(ctx, country: string, lg: ELanguage) {
    try {
      const text = this.languagesJsonParser.get(lg);
      ctx.editMessageText(text, serviceKeyboard);
      await Emails.updateOne(
        { userTelegramId: ctx.update.callback_query.from.id },
        { $set: { country: country } }
      );
      console.log(ctx);
    } catch (e) {
      console.log(e);
    }
  }

  private async handleRegion(ctx, region: string) {
    try {
      ctx.editMessageText("Гражданство?", countryKeyboard);
      await Emails.updateOne(
        { userTelegramId: ctx.update.callback_query.from.id },
        { $set: { region: region } }
      );
      console.log(ctx);
    } catch (e) {
      console.log(e);
    }
  }

  private async handleService(ctx, service: string) {
    try {
      ctx.editMessageText("Как Вас зовут?");
      await Emails.updateOne(
        { userTelegramId: ctx.update.callback_query.from.id },
        { $set: { type: service, state: State.sendName } }
      );
    } catch (e) {
      console.log(e);
    }
  }

  private async stateHandler(ctx: Context) {
    const message = ctx.message as TgMessage;
    const userId = message.from.id;
    try {
      const user = await Emails.findOne({ userTelegramId: userId });
      console.log(user);
      if (!user) this.start(ctx);
      switch (user.state) {
        case State.sendName:
          const res1 = await Emails.updateOne(
            { userTelegramId: userId },
            { $set: { userName: message.text, state: State.sendPhone } }
          );
          console.log("стейт стал сendphone  ", res1);
          ctx.reply(
            "Отправьте номер телефона, нажмите на кнопку ниже 👇🏼",
            phoneKeyboard
          );
          break;
        case State.sendPhone:
          if (message?.contact) {
            console.log(message.contact.phone_number);
            await Emails.updateOne(
              { userTelegramId: userId },
              {
                $set: {
                  phone: message.contact.phone_number,
                  state: State.default,
                },
              }
            );
            const res = await await Emails.findOne({ userTelegramId: userId });
            await this.sendEmail(res);
            ctx.reply("Заявка будет рассмотрена в ближайшее время.");
          } else {
            ctx.reply(
              "Отправьте номер телефона, нажмите на кнопку ниже 👇🏼",
              phoneKeyboard
            );
            return;
          }
          break;
        // case State.sendDoc:
        //   if (!(await this.validateDoc(message))) {
        //     ctx.reply("Отправьте PDF скан паспорта!");
        //     return;
        //   } else {
        //     ctx.reply("Письмо отправлено!");
        //     await Emails.updateOne(
        //       { userTelegramId: userId },
        //       { $set: { doc: message.document.file_id, state: State.default } }
        //     );
        //     const res = await await Emails.findOne({ userTelegramId: userId });
        //     await this.sendEmail(res);
        //   }
        //   break;
        // case State.sendDoc:
        //   if (!(await this.validateDoc(message))) {
        //     ctx.reply("Отправьте PDF скан паспорта!");
        //     return;
        //   } else {
        //     ctx.reply("Письмо отправлено!");
        //     await Emails.updateOne(
        //       { userTelegramId: userId },
        //       { $set: { doc: message.document.file_id, state: State.default } }
        //     );
        //     const res = await await Emails.findOne({ userTelegramId: userId });
        //     await this.sendEmail(res);
        //   }
        //   break;
        case State.default:
          ctx.reply("Нажмите на кнопку выше");
          break;
      }
    } catch (e) {
      ctx.reply("Где-то что-то пошло не так, попробуйте позже😔");
    }
  }

  private async clearBD() {
    await Emails.remove();
  }

  // private async validateDoc(message) {
  //   if (message?.document) {
  //     const doc = message.document.file_id;
  //     const fileInfo = await this.bot.telegram.getFile(doc);
  //     const fileLink = await this.bot.telegram.getFileLink(doc);
  //     console.log(fileInfo, "________---_____", fileLink);
  //     const fileExtension = fileInfo.file_path.split(".").splice(-1)[0];
  //     if (fileExtension == "pdf") {
  //       console.log(fileExtension);
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else if (message?.photo) {
  //     return false;
  //   }
  //   return false;
  // }

  // private async cancelSending(ctx: Context) {
  //   const message = ctx.message as TgMessage;
  //   console.log(message);
  //   const userId = message.from.id;
  //   try {
  //     await Emails.deleteOne({ userTelegramId: userId });
  //     const keyboard = Markup.keyboard(["Отправить"]).resize(true);
  //     ctx.reply("Письмо удалено. Хотите отправить новое?");
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // private async copyDocument(doc) {
  //   // console.log(doc);
  //   const fileInfo = await this.bot.telegram.getFile(doc);
  //   const fileLink = await this.bot.telegram.getFileLink(doc);
  //   console.log(fileInfo, "________---_____", fileLink);
  //   const fileExtension = fileInfo.file_path.split(".").splice(-1)[0];
  //   console.log(fileExtension);
  //   const fileName = `${doc}.${fileExtension}`;
  //   // console.log("openfile_____________\n",fs.open(fileName, "r"))
  //   await needle
  //     .get(`${fileLink.href}`)
  //     .pipe(fs.createWriteStream(`documents/${fileName}`))
  //     .on("done", function (err) {
  //       console.log("Pipe finished!");
  //     });
  //   return [fileName, fileExtension];
  // }

  private async sendEmail(mail) {
    console.log(__dirname);
    try {
      // console.log("допустим отправилось");
      // // console.log(mail);
      // // const [fileName, ext] = await this.copyDocument(mail.doc);
      // // console.log("filename is:", fileName, "\n", ext, "\n nigger");
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing

      // create reusable transporter object using the default SMTP transport
      console.log(config.mailHost);
      let transporter = nodemailer.createTransport({
        host: config.mailHost,
        port: config.mailPort,
        secure: true, // true for 465, false for other ports
        auth: {
          user: config.mailUser,
          pass: config.mailPass,
        },
      });

      // // const dirname = __dirname.split("/").slice(0, -2).join("/");
      // // console.log(dirname);
      let text = "default";
      if (mail?.userName) {
        text = mail.userName.split(" ").join("_");
      }
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: "vipkrutoi@mail.ru", // sender address
        to: "vipkrutoi@mail.ru", // list of receivers
        // to: "vipkrutoi@mail.ru",
        subject: mail.userName, // Subject line
        text: `Тема обращения: ${mail.type} \nГражданство: ${mail.country} \nРегион проживания: ${mail.region} \nФИО: ${mail.userName} \nНомер телефона: ${mail.phone}`, // plain text body
        //html: `${mail.text}`, // html body
        // // attachments: {
        // //   filename: `${text}.${ext}`,
        // //   path: dirname + `/documents/${fileName}`,
        // //   cid: `${fileName}`, // should be as unique as possible
        // // },
      });

      // fs.unlink(dirname + `/documents/${fileName}`, (err) => {
      //   if (err) throw err; // не удалось удалить файл
      //   console.log("Файл успешно удалён");
      // });

      console.log("Message sent: %s", info);
      return true;
    } catch (e) {
      console.log(e);
    }
  }

  private async start(ctx: Context) {
    try {
      await Emails.deleteOld();
      const message = ctx.message as TgMessage;
      const userId = message.from.id;

      await Emails.deletePrevious(userId as unknown as string);

      console.log(message);

      let greeting = "Добрый день";

      await new Emails({ userTelegramId: userId }).save();

      if (message?.from?.first_name)
        greeting += ", " + message.from.first_name + "!\n";
      else greeting += "!\n";

      // const keyboard = Markup.keyboard(["Отправить"]).resize(true);
      await this.bot.telegram.sendMessage(
        userId,
        greeting + "Выберите место проживания.\n",
        regionKeyboard
      );
    } catch (e) {
      console.log(e);
      ctx.reply("Unknown error accured: ", e.message);
    }
  }
}
