const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '555d81f63d385551098b069faf59b206-4b98b89f-883c27f4'
});

const sendEmail = async ({ to, subject, bodyHtml, bodyText, attachments }) => {
  try {
    await mg.messages.create('sandbox5841367a8b4844df8c700ad85533a630.mailgun.org', {
      from: 'Excited User <mailgun@sandbox5841367a8b4844df8c700ad85533a630.mailgun.org>',
      to: [to],
      subject: subject,
      text: bodyText,
      html: bodyHtml,
      attachments: attachments,
    });
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.sendEmail = async (args) => {
  if (process.env.NODE_ENV === 'development') {
    return sendEmail(args);
  } else {
    return Promise.resolve();
  }
};
