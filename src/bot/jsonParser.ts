// import fs from "fs";
const fs = require("fs");
export enum ELanguage {
  UZ = "uz",
  RU = "ru",
  TJ = "tj",
}

export class LanguagesJsonParser {
  private data: { uz: string; ru: string; tj: string };

  constructor(private readonly filePath: string) {
    this.data = JSON.parse(fs.readFileSync(filePath).toString());
  }

  public get(language: ELanguage): string {
    return this.data[language];
  }

  public set(language: ELanguage, text: string): void {
    this.data[language] = text;
    fs.writeFileSync(this.filePath, JSON.stringify(this.data));
  }
}

// const languagesJsonParser = new LanguagesJsonParser("./texts.json");

// const uz = languagesJsonParser.get(ELanguage.UZ);
// console.log(uz);

// const ru = languagesJsonParser.get(ELanguage.RU);
// console.log(ru);

// languagesJsonParser.set(ELanguage.RU, "гагага я сосал меня сосали");
// console.log(languagesJsonParser.get(ELanguage.RU));