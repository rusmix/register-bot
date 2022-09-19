import { Aggregate, model, Schema } from "mongoose";
import { IModel, IDocument, IMongoose, IObject } from "./types";
import { State, USERS_COLLECTION_NAME } from "./constants";

const { Types } = Schema;

const UserSchema = new Schema<IDocument, IModel>(
  {
    telegramId: {
      type: Types.String,
      required: true,
    },
    username: {
      type: Types.String,
    },
    firstName: {
      type: Types.String,
    },
    lastName: {
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

UserSchema.pre<IObject>("save", function () {
  this.updatedAt = new Date();
});

UserSchema.statics.createIfNotExists = async function (
  user: IMongoose
): Promise<IObject> {
  const existingUser = await Users.findOne({
    telegramId: user.telegramId,
  });
  if (existingUser) return existingUser;
  return new Users({
    telegramId: user.telegramId,
    username: user?.username,
    first_name: user?.firstName,
    last_name: user?.lastName,
  }).save();
};


export const Users = model<IDocument, IModel>(
  USERS_COLLECTION_NAME,
  UserSchema,
  USERS_COLLECTION_NAME
);
