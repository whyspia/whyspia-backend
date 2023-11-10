/* eslint-disable no-empty */

import type { UploadedFile } from 'express-fileupload'
import { v4 as uuidv4 } from 'uuid'

import { putObjectInS3 } from './awsS3Util'

export async function uploadFileToS3({
  file,
  s3Bucket,
}: {
  file: UploadedFile
  s3Bucket: string
}) {
  try {
    const [, fileExt] = file.name.split('.')
    const fileName = `${uuidv4()}.${fileExt}`
    await putObjectInS3({
      object: file.data,
      s3Bucket,
      key: fileName,
      fileType: file.mimetype,
    })
    return fileName
  } catch {}

  return null
}
