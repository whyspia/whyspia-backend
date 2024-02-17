import mongoose from 'mongoose'

export interface IEmoteNotif {
  emoteID: string
  hasReadCasually: boolean // has receivingUser read this casually (handles if to show alert on frontend any more or not)
  hasReadDirectly: boolean // receiverSymbol directly clicked on notif or some button to say they saw it
}
  
interface IEmoteNotifModel extends mongoose.Model<EmoteNotifDocument> {
  build(attr: IEmoteNotif): EmoteNotifDocument
}

interface EmoteNotifDocument extends mongoose.Document {
  emoteID: string
  hasReadCasually: boolean
  hasReadDirectly: boolean
}

const EmoteNotifSchema = new mongoose.Schema(
  {
    emoteID: { type: String, ref: 'Emote', required: true },
    hasReadCasually: { type: Boolean, required: true },
    hasReadDirectly: { type: Boolean, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

EmoteNotifSchema.statics.build = (attr: IEmoteNotif) => {
  return new EmoteNotifModel(attr)
}

const EmoteNotifModel = mongoose.model<EmoteNotifDocument, IEmoteNotifModel>(
  'EmoteNotif',
  EmoteNotifSchema
)

export { EmoteNotifModel, EmoteNotifDocument }
