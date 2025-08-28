const fs = require('fs')
const path = require('path')

const config = {
  JsonWebToken: {
    privateKey: fs.readFileSync(path.join(__dirname, 'private.key')),
    publicKey: fs.readFileSync(path.join(__dirname, 'public.key'))
  },
  Database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 48000,
    user: process.env.DB_USER || 'webdoc',
    password: process.env.DB_PASSWORD || 'SeTW7G2rRLArt3hb',
    database: process.env.DB_DATABASE || 'webdoc'
  },
  Service: {
    port: Number(process.env.SERVICE_PORT) || 10610,
    url: process.env.SERVICE_URL || 'http://localhost:10610'
  },
  Mailer: {
    host: process.env.MAILER_HOST || null,
    port: process.env.MAILER_PORT || null,
    secure: process.env.MAILER_SECURE === 'true' ? true : false,
    auth: {
      user: process.env.MAILER_USER || null,
      pass: process.env.MAILER_PASS || null
    }
  }
}

module.exports = config