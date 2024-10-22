/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface INonce {
  userID: string  // only using signingAddress rn, but this could technically use any ID of a user
  nonce: string
}

interface INonceModel extends mongoose.Model<NonceDocument> {
  build(attr: INonce): NonceDocument
}

interface NonceDocument extends mongoose.Document {
  userID: string
  nonce: string
}

const NonceSchema = new mongoose.Schema(
  {
    userID: { type: String, required: true },
    nonce: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// create a TTL index on the createdAt field - this means all docs/records are deleted after 5 minutes of being created
NonceSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 }) // Set TTL to 5 minutes

NonceSchema.statics.build = (attr: INonce) => {
  return new NonceModel(attr)
}

const NonceModel = mongoose.model<NonceDocument, INonceModel>(
  'Nonce',
  NonceSchema
)

export { NonceModel, NonceDocument }
