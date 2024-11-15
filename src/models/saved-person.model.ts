import mongoose from 'mongoose'

export interface ISavedPerson {
  savedBy: string
  primaryWalletSaved: string
  chosenName: string
}

interface ISavedPersonModel extends mongoose.Model<SavedPersonDocument> {
  build(attr: ISavedPerson): SavedPersonDocument
}

interface SavedPersonDocument extends mongoose.Document {
  savedBy: string
  primaryWalletSaved: string
  chosenName: string
}

const SavedPersonSchema = new mongoose.Schema(
  {
    savedBy: { type: String, ref: 'UserV2', required: true },
    primaryWalletSaved: { type: String, ref: 'UserV2', required: true },
    chosenName: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

SavedPersonSchema.statics.build = (attr: ISavedPerson) => {
  return new SavedPersonModel(attr)
}

const SavedPersonModel = mongoose.model<SavedPersonDocument, ISavedPersonModel>(
  'SavedPerson',
  SavedPersonSchema
)

export { SavedPersonModel, SavedPersonDocument }
