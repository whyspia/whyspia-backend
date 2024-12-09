import mongoose from 'mongoose'

export interface IEmote {
  senderPrimaryWallet: string
  receiverSymbols: string[]
  sentSymbols: string[]
}
  
interface IEmoteModel extends mongoose.Model<EmoteDocument> {
  build(attr: IEmote): EmoteDocument
}

interface EmoteDocument extends mongoose.Document {
  senderPrimaryWallet: string
  receiverSymbols: string[]
  sentSymbols: string[]
}

const EmoteSchema = new mongoose.Schema(
  {
    senderPrimaryWallet: { type: String, ref: 'UserV2', required: true },
    receiverSymbols: [{ type: String, ref: 'UserV2', required: true }],
    sentSymbols: [{ type: String, required: true }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

EmoteSchema.statics.build = (attr: IEmote) => {
  return new EmoteModel(attr)
}

const EmoteModel = mongoose.model<EmoteDocument, IEmoteModel>(
  'Emote',
  EmoteSchema
)

export { EmoteModel, EmoteDocument }
