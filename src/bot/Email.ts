import { ObjectId } from "mongodb";
import { Aggregate, Document, Model, Schema, model } from "mongoose";

const { Types } = Schema;

export enum State {
  sendName = "sendName",
  sendPhone = "sendPhone",
  sendDoc = "sendDoc",
  default = "default"
}

export interface IMongoose {
  userTelegramId: string;
  userName: string;
  type: string;
  country: string;
  region: string;
  phone: string;
  doc: string;
  state: State;
}

export interface IObject extends IMongoose {
  _id: Document["_id"];

  createdAt: Date;
  updatedAt: Date;
}

export interface IDocument extends IObject, Document {
  _id: Document["_id"];
}

export interface IModel extends Model<IDocument> {
  // createIfNotExists(mail: IMongoose): Promise<IObject>;
  deleteOld(): Promise<void>;
}

const EmailSchema = new Schema<IDocument, IModel>(
  {
    userTelegramId: {
      type: Types.String,
    },
    userName: {
      type: Types.String,
    },
    country: {
      type: Types.String,
    },
    region: {
      type: Types.String,
    },
    type: {
      type: Types.String,
    },
    phone: {
      type: Types.String,
    },
    doc: {
      type: Types.String,
    },
    state: {
      type: Types.String,
      enum: State,
      default: State.default,
    },
    createdAt: {
      type: Types.Date,
      default: Date.now,
    },
    updatedAt: {
      type: Types.Date,
      default: Date.now,
    },
  },
  {
    minimize: false,
  }
);

EmailSchema.pre<IObject>("save", function () {
  this.updatedAt = new Date();
});

// EmailSchema.statics.createIfNotExists = async function (
//   mail: IMongoose
// ): Promise<IObject> {
//   return new Emails({
//     userTelegramId: mail.userTelegramId,
//     userName: mail.userName,
//     text: mail.text,
//     doc: mail.doc,
//   }).save();
// };

EmailSchema.statics.deleteOld = async function (): Promise<void> {
  const currentDate = new Date();
  const pastDate = new Date(
    Math.abs(new Date().getTime() - 24 * 60 * 60 * 1000)
  );
  console.log(currentDate, " ", pastDate);
  await Emails.deleteMany({ createdAt: { $lte: pastDate } });
};

export const Emails = model<IDocument, IModel>("Emails", EmailSchema, "Emails");
