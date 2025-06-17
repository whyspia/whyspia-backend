import mongoose from 'mongoose'

export interface IVibecampTopic {
  contact: string
  topic: string
  additional?: string
}

interface IVibecampTopicModel extends mongoose.Model<VibecampTopicDocument> {
  build(attr: IVibecampTopic): VibecampTopicDocument
}

interface VibecampTopicDocument extends mongoose.Document {
  contact: string
  topic: string
  additional?: string
  createdAt: Date
  updatedAt: Date
}

const VibecampTopicSchema = new mongoose.Schema(
  {
    contact: { type: String, required: true },
    topic: { type: String, required: true },
    additional: { type: String, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

VibecampTopicSchema.statics.build = (attr: IVibecampTopic) => {
  return new VibecampTopicModel(attr)
}

const VibecampTopicModel = mongoose.model<VibecampTopicDocument, IVibecampTopicModel>(
  'VibecampTopic',
  VibecampTopicSchema
)

export { VibecampTopicModel, VibecampTopicDocument } 