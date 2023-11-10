import mongoose from 'mongoose'

export interface ISymbolDefinition {
  senderTwitterUsername: string
  symbol: string
  currentDefinition: string
  pastDefinitions: Array<{ definition: string; dateCreated: Date }> | null
}
  
interface ISymbolDefinitionModel extends mongoose.Model<SymbolDefinitionDocument> {
  build(attr: ISymbolDefinition): SymbolDefinitionDocument
}

interface SymbolDefinitionDocument extends mongoose.Document {
  senderTwitterUsername: string
  symbol: string
  currentDefinition: string
  pastDefinitions: Array<{ definition: string; dateCreated: Date }> | null
}

const SymbolDefinitionSchema = new mongoose.Schema(
  {
    senderTwitterUsername: { type: String, ref: 'UserToken', required: true },
    symbol: { type: String, ref: 'Symbol', required: true },
    currentDefinition: { type: String, required: true },
    pastDefinitions: [
      {
        definition: { type: String, required: true },
        dateCreated: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

SymbolDefinitionSchema.statics.build = (attr: ISymbolDefinition) => {
  return new SymbolDefinitionModel(attr)
}

const SymbolDefinitionModel = mongoose.model<SymbolDefinitionDocument, ISymbolDefinitionModel>(
  'SymbolDefinition',
  SymbolDefinitionSchema
)

export { SymbolDefinitionModel, SymbolDefinitionDocument }
