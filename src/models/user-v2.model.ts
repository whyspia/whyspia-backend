/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

// define the external type for wallets
export type Wallet = {
  chain_name: string
  public_address: string
  uuid: string
}

export interface IUserV2 {
  particleUUID: string
  wallets: Wallet[]
  primaryWallet: string
}

interface IUserV2Model extends mongoose.Model<UserV2Document> {
  build(attr: IUserV2): UserV2Document
}

interface UserV2Document extends mongoose.Document {
  particleUUID: string
  wallets: Wallet[]
  primaryWallet: string
}

const UserV2Schema = new mongoose.Schema(
  {
    particleUUID: {
      type: String,
      required: true,
    },
    wallets: {
      type: [{
        chain_name: String,
        public_address: String,
        uuid: String,
      }],
      required: true
    },
    primaryWallet: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

UserV2Schema.statics.build = (attr: IUserV2) => {
  return new UserV2Model(attr)
}

const UserV2Model = mongoose.model<UserV2Document, IUserV2Model>(
  'UserV2',
  UserV2Schema
)

export { UserV2Model, UserV2Document }
