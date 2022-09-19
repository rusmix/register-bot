require('dotenv').config()
export class Config {
  public static mailHost = process.env.MAIL_HOST;
  public static mailUser = process.env.MAIL_USER;
  public static mailPass = process.env.MAIL_PASS;
  public static mailPort = process.env.MAIL_PORT;
}
