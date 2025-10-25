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
import nodemailer from 'nodemailer';

// Create transporter for Ethereal Email (testing)
let transporter: any = null;

/**
 * Initialize email transporter
 */
const initTransporter = async () => {
  if (transporter) return transporter;

  // Use Ethereal credentials from .env if available
  const etherealUser = process.env.ETHEREAL_USER;
  const etherealPass = process.env.ETHEREAL_PASS;

  if (etherealUser && etherealPass) {
    // Use provided Ethereal credentials
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealUser,
        pass: etherealPass,
      },
    });
  } else {
    // Create test account automatically
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('📧 Ethereal Email Account Created:');
    console.log('   User:', testAccount.user);
    console.log('   Pass:', testAccount.pass);
    console.log('   Preview emails at: https://ethereal.email');
  }

  return transporter;
};

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const transport = await initTransporter();

    const info = await transport.sendMail({
      from: '"Event Management App" <noreply@eventapp.com>',
      to: email,
      subject: 'Welcome to Event Management App! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome, ${name}! 🎉</h1>
          <p>Thank you for signing up for Event Management App!</p>
          <p>You can now:</p>
          <ul>
            <li>Browse upcoming events</li>
            <li>RSVP to events you're interested in</li>
            <li>Create your own events (if you're an organizer)</li>
            <li>Get real-time updates about events</li>
          </ul>
          <p>Happy event planning!</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is a test email sent via Ethereal Email.
          </p>
        </div>
      `,
    });

    console.log('✅ Welcome email sent to:', email);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send event notification email
 */
export const sendEventNotification = async (
  email: string,
  eventTitle: string,
  eventDate: Date,
  action: 'created' | 'updated' | 'deleted'
) => {
  try {
    const transport = await initTransporter();

    const actionText = {
      created: 'New Event Created',
      updated: 'Event Updated',
      deleted: 'Event Cancelled',
    };

    const info = await transport.sendMail({
      from: '"Event Management App" <noreply@eventapp.com>',
      to: email,
      subject: `${actionText[action]}: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">${actionText[action]}</h1>
          <h2>${eventTitle}</h2>
          <p><strong>Date:</strong> ${eventDate.toLocaleString()}</p>
          ${action === 'deleted' ? 
            '<p style="color: #DC2626;">This event has been cancelled.</p>' : 
            '<p>Visit the app to see more details and RSVP!</p>'
          }
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is a test email sent via Ethereal Email.
          </p>
        </div>
      `,
    });

    console.log(`✅ Event ${action} notification sent to:`, email);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (error) {
    console.error('❌ Error sending event notification:', error);
    throw error;
  }
};

/**
 * Send RSVP confirmation email
 */
export const sendRSVPConfirmation = async (
  email: string,
  name: string,
  eventTitle: string,
  status: string
) => {
  try {
    const transport = await initTransporter();

    const statusEmoji = {
      GOING: '✅',
      MAYBE: '🤔',
      NOT_GOING: '❌',
    };

    const info = await transport.sendMail({
      from: '"Event Management App" <noreply@eventapp.com>',
      to: email,
      subject: `RSVP Confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">RSVP Confirmed ${statusEmoji[status as keyof typeof statusEmoji] || ''}</h1>
          <p>Hi ${name},</p>
          <p>Your RSVP status for <strong>${eventTitle}</strong> has been updated to: <strong>${status}</strong></p>
          <p>You can change your RSVP anytime through the app.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is a test email sent via Ethereal Email.
          </p>
        </div>
      `,
    });

    console.log('✅ RSVP confirmation sent to:', email);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (error) {
    console.error('❌ Error sending RSVP confirmation:', error);
    throw error;
  }
};
