import mongoose from 'mongoose'
import { SAVED_SYMBOL_TYPES } from '../util/definedEventUtil'

export interface IDefinedEvent {
  eventName: string
  eventDescription: string | null
  eventCreator: string
  savedSymbolTypes: SAVED_SYMBOL_TYPES[]
}
  
interface IDefinedEventModel extends mongoose.Model<DefinedEventDocument> {
  build(attr: IDefinedEvent): DefinedEventDocument
}

interface DefinedEventDocument extends mongoose.Document {
  eventName: string
  eventDescription: string | null
  eventCreator: string
  savedSymbolTypes: SAVED_SYMBOL_TYPES[]
}

const DefinedEventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    eventDescription: { type: String, required: false },
    eventCreator: { type: String, ref: 'UserV2', required: true },
    savedSymbolTypes: { 
      type: [String], 
      enum: Object.values(SAVED_SYMBOL_TYPES),
      required: false,
      default: []
    },
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
