var fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  async = require('async'),
  check = require('check-types')

var LocalFsStorageProvider = function(options) {
  this._options = options

  check.verify.object(this._options, 'Please pass some options to LocalFS')
  check.verify.string(this._options.directory, 'A directory to store files in must be specified')

  if(typeof(this._options.path) != "function") {
    this._options.path = function(attachment) {
      return '/' + path.basename(attachment.path)
    }
  }
}

LocalFsStorageProvider.prototype.save = function(attachment, doc, callback) {
  var target = path.join(this._options.directory, this._options.path(attachment))
  target = path.resolve(target)

  if(target.substring(0, this._options.directory.length) != this._options.directory) {
    return callback(new Error('Will only store files under our storage directory'))
  }

  async.series([function(callback) {
    // ensure that the output directory exists
    mkdirp(this._options.directory, callback)
  }.bind(this), function(callback) {
    // copy the file into the directory
    fs.rename(attachment.path, target, callback)
  }.bind(this)], function(error) {
    callback(error, target)
  })
}

LocalFsStorageProvider.prototype.remove = function(attachment, doc, callback) {
  if(!attachment.url) {
    return callback()
  }

  if(attachment.url.substring(0, this._options.directory.length) != this._options.directory) {
    return callback(new Error('Will not delete files that are not under our storage directory'))
  }

  // only delete the file if it actually exists
  fs.exists(attachment.url, function(exists) {
    if(exists) {
      fs.unlink(attachment.url, callback)
    } else {
      callback()
    }
  })
}

module.exports = LocalFsStorageProvider
