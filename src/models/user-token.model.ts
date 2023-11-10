/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface IUserToken {
  requestToken: string
  requestTokenSecret: string
  accessToken?: string
  accessTokenSecret?: string
  twitterUserId?: string
  twitterUsername?: string
}

interface IUserTokenModel extends mongoose.Model<UserTokenDocument> {
  build(attr: IUserToken): UserTokenDocument
}

interface UserTokenDocument extends mongoose.Document {
  requestToken: string
  requestTokenSecret: string
  accessToken: string
  accessTokenSecret: string
  twitterUserId: string
  twitterUsername: string
}

const UserTokenSchema = new mongoose.Schema(
  {
    requestToken: { type: String, required: true, index: true, unique: true },
    requestTokenSecret: { type: String, required: true },
    accessToken: { type: String, required: false },
    accessTokenSecret: { type: String, required: false },
    twitterUserId: { type: String, required: false },
    twitterUsername: { type: String, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

UserTokenSchema.statics.build = (attr: IUserToken) => {
  return new UserTokenModel(attr)
}

const UserTokenModel = mongoose.model<UserTokenDocument, IUserTokenModel>(
  'UserToken',
  UserTokenSchema
)

export { UserTokenModel, UserTokenDocument }
