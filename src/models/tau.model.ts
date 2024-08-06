import mongoose from 'mongoose'

export interface ITAU {
  senderSymbol: string
  receiverSymbol: string
  additionalMessage: string
}
  
interface ITAUModel extends mongoose.Model<TAUDocument> {
  build(attr: ITAU): TAUDocument
}

interface TAUDocument extends mongoose.Document {
  senderSymbol: string
  receiverSymbol: string
  additionalMessage: string
}

const TAUSchema = new mongoose.Schema(
  {
    senderSymbol: { type: String, ref: 'UserToken', required: true },
    receiverSymbol: { type: String, ref: 'UserToken', required: true },
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
