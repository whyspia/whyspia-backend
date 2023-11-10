/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface ICategory {
  name: string
  enabled: boolean
  hidden: boolean
  startDate: Date | null | undefined
  endDate: Date | null | undefined
}

interface ICategoryModel extends mongoose.Model<CategoryDocument> {
  build(attr: ICategory): CategoryDocument
}

export interface CategoryDocument extends mongoose.Document {
  name: string
  enabled: boolean
  hidden: boolean
  startDate: Date | null
  endDate: Date | null
}

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true, unique: true },
    enabled: { type: Boolean, required: true, default: true },
    hidden: { type: Boolean, required: true, default: false },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

CategorySchema.statics.build = (attr: ICategory) => {
  return new CategoryModel(attr)
}

export const CategoryModel = mongoose.model<CategoryDocument, ICategoryModel>(
  'Category',
  CategorySchema
)
