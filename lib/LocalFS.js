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

    if (typeof(this._options.path) != "function") {
      this._options.path = function(attachment) {
        return '/' + path.basename(attachment.path)
      }
    }
  }

  save (attachment, callback) {
    let target = path.join(this._options.directory, this._options.path(attachment))
    target = path.resolve(target)

    if (target.substring(0, this._options.directory.length) != this._options.directory) {
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

    if (attachment.url.substring(0, this._options.directory.length) != this._options.directory) {
      return callback(new Error('Will not delete files that are not under our storage directory'))
    }

    // only delete the file if it actually exists
    fs.exists(attachment.url, (exists) => {
      if(exists) {
        fs.unlink(attachment.url, callback)
      } else {
        callback()
      }
    })
  }
}

module.exports = LocalFsStorageProvider
