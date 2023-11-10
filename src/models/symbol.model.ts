import mongoose from 'mongoose'

export interface ISymbol {
  name: string
}

interface ISymbolModel extends mongoose.Model<SymbolDocument> {
  build(attr: ISymbol): SymbolDocument
}

interface SymbolDocument extends mongoose.Document {
  name: string
}

const SymbolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

SymbolSchema.statics.build = (attr: ISymbol) => {
  return new SymbolModel(attr)
}

const SymbolModel = mongoose.model<SymbolDocument, ISymbolModel>(
  'Symbol',
  SymbolSchema
)

export { SymbolModel, SymbolDocument }
