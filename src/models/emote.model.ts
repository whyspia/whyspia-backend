import mongoose from 'mongoose'

export interface IEmote {
  senderTwitterUsername: string
  receiverSymbols: string[]
  symbol: string
}
  
interface IEmoteModel extends mongoose.Model<EmoteDocument> {
  build(attr: IEmote): EmoteDocument
}

interface EmoteDocument extends mongoose.Document {
  senderTwitterUsername: string
  receiverSymbols: string[]
  symbol: string
}

const EmoteSchema = new mongoose.Schema(
  {
    senderTwitterUsername: { type: String, ref: 'UserToken', required: true },
    receiverSymbols: [{ type: String, ref: 'UserToken', required: true }],
    symbol: { type: String, required: true },
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
