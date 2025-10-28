import nodemailer from 'nodemailer'

// Simple email service using SMTP credentials from env.
const host = process.env.EMAIL_HOST
const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587
const user = process.env.EMAIL_USER
const pass = process.env.EMAIL_PASS

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: user && pass ? { user, pass } : undefined,
})

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    const info = await transporter.sendMail({
      from: user,
      to,
      subject,
      text,
    })
    return info
  } catch (err) {
    console.error('Email send failed', err)
    throw err
  }
}
