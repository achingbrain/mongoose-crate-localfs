'use strict'

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const async = require('async')
const check = require('check-types')

class LocalFsStorageProvider {
  constructor (options) {
    this._options = options

    check.assert.object(this._options, 'Please pass some options to LocalFS')
    check.assert.string(this._options.directory, 'A directory to store files in must be specified')

    if (typeof this._options.path !== 'function') {
      this._options.path = (attachment) => {
        return '/' + path.basename(attachment.path)
      }
    }
  }

  save (attachment, callback) {
    const target = path.resolve(path.join(this._options.directory, this._options.path(attachment)))

    if (target.substring(0, this._options.directory.length) !== this._options.directory) {
      return callback(new Error('Will only store files under our storage directory'))
    }

    async.series([(callback) => {
      // ensure that the output directory exists
      mkdirp(this._options.directory, callback)
    }, (callback) => {
      // copy the file into the directory
      fs.rename(attachment.path, target, callback)
    }], (error) => {
      callback(error, target)
    })
  }

  remove (attachment, callback) {
    if (!attachment.url) {
      return callback()
    }

    if (attachment.url.substring(0, this._options.directory.length) !== this._options.directory) {
      return callback(new Error('Will not delete files that are not under our storage directory'))
    }

    fs.unlink(attachment.url, (error) => {
      if (error && error.code === 'ENOENT') {
        // file did not exist before deletion
        error = null
      }

      callback(error)
    })
  }
}

module.exports = LocalFsStorageProvider
