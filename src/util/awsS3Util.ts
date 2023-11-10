import AWS from 'aws-sdk'
import type { Body } from 'aws-sdk/clients/s3'
import config from 'config'

const AWS_ACCESS_KEY: string = config.get('aws.accessKey')
const AWS_SECRET_KEY: string = config.get('aws.secretKey')
const AWS_REGION: string = config.get('aws.region')

/**
 * This function will upload an object to S3 using putObject method
 */
export async function putObjectInS3({
  object,
  s3Bucket,
  key,
  fileType,
}: {
  object: Body
  s3Bucket: string
  key: string
  fileType: string
}) {
  try {
    updateAWSConfig()
    const s3Client = new AWS.S3()
    await s3Client
      .putObject({
        Bucket: s3Bucket,
        Key: key,
        Body: object,
        ContentType: fileType,
      })
      .promise()
  } catch (error) {
    console.error('Error occurred while putting object in S3', error)
  }
}

/**
 * This function will delete an object from S3 using deleteObject method
 */
export async function deleteObjectFromS3({
  s3Bucket,
  key,
}: {
  s3Bucket: string
  key: string
}) {
  try {
    updateAWSConfig()
    const s3Client = new AWS.S3()
    await s3Client
      .deleteObject({
        Bucket: s3Bucket,
        Key: key,
      })
      .promise()
  } catch (error) {
    console.error('Error occurred while deleting object from S3', error)
  }
}

function updateAWSConfig() {
  AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    region: AWS_REGION,
    signatureVersion: 'v4',
  })
}
