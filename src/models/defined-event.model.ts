import mongoose from 'mongoose'

export interface IDefinedEvent {
  eventName: string
  eventDescription: string | null
  eventCreator: string
}
  
interface IDefinedEventModel extends mongoose.Model<DefinedEventDocument> {
  build(attr: IDefinedEvent): DefinedEventDocument
}

interface DefinedEventDocument extends mongoose.Document {
  eventName: string
  eventDescription: string | null
  eventCreator: string
}

const DefinedEventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    eventDescription: { type: String, required: false },
    eventCreator: { type: String, ref: 'UserToken', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

DefinedEventSchema.statics.build = (attr: IDefinedEvent) => {
  return new DefinedEventModel(attr)
}

const DefinedEventModel = mongoose.model<DefinedEventDocument, IDefinedEventModel>(
  'DefinedEvent',
  DefinedEventSchema
)

export { DefinedEventModel, DefinedEventDocument }
