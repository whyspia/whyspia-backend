import mongoose from 'mongoose'

export interface IPingpplFollow {
  eventNameFollowed: string // name of event followed
  eventSender: string
  followSender: string
}
  
interface IPingpplFollowModel extends mongoose.Model<PingpplFollowDocument> {
  build(attr: IPingpplFollow): PingpplFollowDocument
}

interface PingpplFollowDocument extends mongoose.Document {
  eventNameFollowed: string
  eventSender: string
  followSender: string
}

const PingpplFollowSchema = new mongoose.Schema(
  {
    eventNameFollowed: { type: String, required: true },
    eventSender: { type: String, ref: 'UserToken', required: true },
    followSender: { type: String, ref: 'UserToken', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

PingpplFollowSchema.statics.build = (attr: IPingpplFollow) => {
  return new PingpplFollowModel(attr)
}

const PingpplFollowModel = mongoose.model<PingpplFollowDocument, IPingpplFollowModel>(
  'PingpplFollow',
  PingpplFollowSchema
)

export { PingpplFollowModel, PingpplFollowDocument }
