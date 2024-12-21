import mongoose from 'mongoose'

export interface ICurrently {
  senderPrimaryWallet: string
  place: { text: string, duration: number, updatedDurationAt: Date } | null // object containing text and duration for place
  wantOthersToKnowTags: { tag: string, duration: number, updatedDurationAt: Date }[] // each tag with its duration
  status: { text: string, duration: number, updatedDurationAt: Date } | null // object containing text and duration for status
}

interface ICurrentlyModel extends mongoose.Model<CurrentlyDocument> {
  build(attr: ICurrently): CurrentlyDocument
}

interface CurrentlyDocument extends mongoose.Document {
  senderPrimaryWallet: string
  place: { text: string, duration: number, updatedDurationAt: Date } | null
  wantOthersToKnowTags: { tag: string, duration: number, updatedDurationAt: Date }[]
  status: { text: string, duration: number, updatedDurationAt: Date } | null
}

const CurrentlySchema = new mongoose.Schema(
  {
    senderPrimaryWallet: { type: String, ref: 'UserV2' },
    place: {
      type: {
        text: { type: String, ref: 'Place' },
        duration: { type: Number }, // duration for placeText
        updatedDurationAt: { type: Date, default: Date.now },
      },
      default: null
    },
    wantOthersToKnowTags: [
      {
        tag: { type: String },
        duration: { type: Number }, // duration for each tag
        updatedDurationAt: { type: Date, default: Date.now },
      }
    ],
    status: {
      type: {
        text: { type: String },
        duration: { type: Number }, // duration for statusText
        updatedDurationAt: { type: Date, default: Date.now },
      },
      default: null
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

CurrentlySchema.statics.build = (attr: ICurrently) => {
  return new CurrentlyModel(attr)
}

const CurrentlyModel = mongoose.model<CurrentlyDocument, ICurrentlyModel>(
  'Currently',
  CurrentlySchema
)

export { CurrentlyModel, CurrentlyDocument }
