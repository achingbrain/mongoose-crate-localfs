var fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  async = require('async'),
  check = require('check-types')

var LocalFsStorageProvider = function(options) {
  this._options = options

  check.verify.object(this._options, 'Please pass some options to LocalFS')

  if(typeof(this._options.path) != "function") {
    this._options.path = function(attachment) {
      return '/' + path.basename(attachment.path)
    }
  }

  if(typeof(this._options.directory) != "function") {
    check.verify.string(this._options.directory, 'A directory to store files in must be specified')
  }
}

LocalFsStorageProvider.prototype.save = function(attachment, doc, callback) {
  doc = doc || this
  var dir = this._options.directory,
    pth, target,
    tasks = [],
    self = this

  if(typeof(this._options.directory) == "function") {
    if(this._options.directory.length > 1) {
      // invoke with callback
      tasks.push(function (next) {
        self._options.directory.call(doc, attachment, function(value) {
          if(value instanceof Error) {
            return next(value)
          }

          dir = value
          next()
        })
      })
    } else {
      tasks.push(function (next) {
        dir = self._options.directory.call(doc, attachment)
        next()
      })
    }
  }

  if(this._options.path.length > 1) {
    // invoke with callback
    tasks.push(function (next) {
      self._options.path.call(doc, attachment, function(value) {
        if(value instanceof Error) {
          return next(value)
        }

        pth = value
        next()
      })
    })
  } else {
    tasks.push(function (next) {
      pth = self._options.path.call(doc, attachment)
      next()
    })
  }

  async.series(tasks, function (err) {
    if (err) {
      return callback(err)
    }

    target = path.join(dir, pth)
    target = path.resolve(target)

    if(target.substring(0, dir.length) != dir) {
      return callback(new Error('Will only store files under our storage directory'))
    }

    async.series([function(callback) {
      // ensure that the output directory exists
      mkdirp(path.dirname(target), callback)
    }.bind(self), function(callback) {
      // copy the file into the directory
      fs.rename(attachment.path, target, callback)
    }.bind(self)], function(error) {
      callback(error, target)
    })
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
