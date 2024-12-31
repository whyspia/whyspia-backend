import mongoose from 'mongoose'

export interface IPlace {
  placeName: string
  visitCount: number
}

interface IPlaceModel extends mongoose.Model<PlaceDocument> {
  build(attr: IPlace): PlaceDocument
}

interface PlaceDocument extends mongoose.Document {
  placeName: string
  visitCount: number
}

const PlaceSchema = new mongoose.Schema(
  {
    placeName: {
      type: String,
      required: true
    },
    visitCount: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

PlaceSchema.statics.build = (attr: IPlace) => {
  return new PlaceModel(attr)
}

const PlaceModel = mongoose.model<PlaceDocument, IPlaceModel>(
  'Place',
  PlaceSchema
)

export { PlaceModel, PlaceDocument }