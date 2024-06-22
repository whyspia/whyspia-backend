import mongoose from 'mongoose'

export interface IDefinedEvent {
  eventSymbol: string
  eventCreator: string
}
  
interface IDefinedEventModel extends mongoose.Model<DefinedEventDocument> {
  build(attr: IDefinedEvent): DefinedEventDocument
}

interface DefinedEventDocument extends mongoose.Document {
  eventSymbol: string
  eventCreator: string
}

const DefinedEventSchema = new mongoose.Schema(
  {
    eventSymbol: { type: String, required: true },
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
