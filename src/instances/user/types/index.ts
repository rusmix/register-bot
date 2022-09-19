import { ObjectId } from "mongodb";
import { Aggregate, Document, Model } from "mongoose";
import { State } from "../constants";

export interface IMongoose {
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
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
    createIfNotExists(user: IMongoose): Promise<IObject>;
}


