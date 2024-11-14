import mongoose from 'mongoose'

export interface ITAU {
  senderPrimaryWallet: string
  receiverPrimaryWallet: string
  additionalMessage: string
}

interface ITAUModel extends mongoose.Model<TAUDocument> {
  build(attr: ITAU): TAUDocument
}

interface TAUDocument extends mongoose.Document {
  senderPrimaryWallet: string
  receiverPrimaryWallet: string
  additionalMessage: string
}

const TAUSchema = new mongoose.Schema(
  {
    senderPrimaryWallet: { type: String, ref: 'UserV2', required: true },
    receiverPrimaryWallet: { type: String, ref: 'UserV2', required: true },
    additionalMessage: { type: String, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

TAUSchema.statics.build = (attr: ITAU) => {
  return new TAUModel(attr)
}

const TAUModel = mongoose.model<TAUDocument, ITAUModel>(
  'TAU',
  TAUSchema
)

export { TAUModel, TAUDocument }
