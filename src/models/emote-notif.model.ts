import mongoose from 'mongoose'

export enum NOTIF_TYPE {
  EMOTE = 'EMOTE',
  PINGPPL_FOLLOW = 'PINGPPL_FOLLOW',
  PINGPPL_SENTEVENT = 'PINGPPL_SENTEVENT',
  NOU_EMOTE_SENT = 'NOU_EMOTE_SENT',
  TAU_SENT = 'TAU_SENT',
}

export interface IEmoteNotif {
  // emoteID: string
  // the notifType and dataID help GETTERS know what data to fetch for different types of notifications. When the notif had no associated emote, you dont wanna get/display emote style data
  notifDataID: string
  notifType: NOTIF_TYPE
  receiverSymbol: string   // you need this now bc emote can have multiple receiverSymbols per Emote
  hasReadCasually: boolean // has receivingUser read this casually (handles if to show alert on frontend any more or not)
  hasReadDirectly: boolean // receiverSymbol directly clicked on notif or some button to say they saw it
  initialNotifData: any    // this is quite useful if needed data for notif is no longer pullable from other places (maybe bc deleted)
}

interface IEmoteNotifModel extends mongoose.Model<EmoteNotifDocument> {
  build(attr: IEmoteNotif): EmoteNotifDocument
}

interface EmoteNotifDocument extends mongoose.Document {
  // emoteID: string
  notifDataID: string
  notifType: NOTIF_TYPE
  receiverSymbol: string
  hasReadCasually: boolean
  hasReadDirectly: boolean
  initialNotifData: any
}

const EmoteNotifSchema = new mongoose.Schema(
  {
    // emoteID: { type: String, ref: 'Emote', required: true },
    notifDataID: { type: String, required: true },
    notifType: { type: String, required: true },
    receiverSymbol: { type: String, ref: 'UserToken', required: true },
    hasReadCasually: { type: Boolean, required: true },
    hasReadDirectly: { type: Boolean, required: true },
    initialNotifData: { type: mongoose.Schema.Types.Mixed, required: false },
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
