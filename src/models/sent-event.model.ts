import mongoose from 'mongoose'

export interface ISentEvent {
  eventName: string
  eventSender: string
  definedEventID: string
}
  
interface ISentEventModel extends mongoose.Model<SentEventDocument> {
  build(attr: ISentEvent): SentEventDocument
}

interface SentEventDocument extends mongoose.Document {
  eventName: string
  eventSender: string
  definedEventID: string
}

const SentEventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    eventSender: { type: String, ref: 'UserToken', required: true },
    definedEventID: { type: String, ref: 'DefinedEvent', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

SentEventSchema.statics.build = (attr: ISentEvent) => {
  return new SentEventModel(attr)
}

const SentEventModel = mongoose.model<SentEventDocument, ISentEventModel>(
  'SentEvent',
  SentEventSchema
)

export { SentEventModel, SentEventDocument }
