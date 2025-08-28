const nodemailer = require('nodemailer')
const config = require('../config')

const mailer = {
  transporter: nodemailer.createTransport({
    host: config.Mailer.host,
    port: config.Mailer.port,
    secure: config.Mailer.secure,
    auth: {
      user: config.Mailer.auth.user,
      pass: config.Mailer.auth.pass
    }
  }),
  sendEmail: async (to, subject, html) => {
    try {
      const info = await mailer.transporter.sendMail({
        from: `"WebDoc" <${config.Mailer.auth.user}>`,
        to: to,
        subject: subject,
        html: html
      })
      return info
    } catch (error) {
      return error
    }
  }
}

module.exports = mailer