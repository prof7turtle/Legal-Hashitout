const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function testEmail() {
  console.log('--- Nodemailer Test ---');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('User:', process.env.EMAIL_USER);
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_USER, // Send to self
    subject: 'Legal-Ease SMTP Test',
    text: 'If you are reading this, your Nodemailer setup is working correctly!',
    html: '<b>Success!</b> Your Nodemailer setup is working correctly for Legal-Ease.',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending test email:');
    console.error(error);
    
    if (error.code === 'EAUTH') {
      console.error('\nTIP: Authentication failed. Please check your EMAIL_USER and EMAIL_PASS (App Password).');
    }
  }
}

testEmail();
