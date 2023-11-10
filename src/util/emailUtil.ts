import sgMail from '@sendgrid/mail'
import config from 'config'

const apiKey: string = config.get('sendgrid.apiKey')
const from: string = config.get('sendgrid.fromEmail')

sgMail.setApiKey(apiKey)

export async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html: string
}) {
  try {
    const message = { to, from, subject, text, html }
    await sgMail.send(message)
  } catch (error) {
    console.error('Error occured while sending email', error)
  }
}

export async function sendMailWithDynamicTemplate({
  to,
  templateId,
  dynamicTemplateData,
}: {
  to: string
  templateId: string
  dynamicTemplateData: any
}) {
  try {
    const message = { to, from, templateId, dynamicTemplateData }
    await sgMail.send(message)
  } catch (error) {
    console.error(
      'Error occured while sending email with dynamic template',
      error
    )
  }
}
