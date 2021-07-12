'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/cjs/vest.production.js')
} else {
  module.exports = require('./dist/cjs/vest.development.js')
}