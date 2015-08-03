var should = require('should'),
  crypto = require('crypto'),
  os = require('os'),
  fs = require('fs'),
  path = require('path'),
  LocalFS = require('../lib/LocalFS')

function randomString(length) {
  return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex')
    .slice(0, length)
}

describe('LocalFS', function() {

  it('should object strenuously if target directory is not specified', function(done) {
    (function() {
      new LocalFS()
    }).should.throw()

    done()
  })

  it('should store a file', function(done) {
    var targetDirectory = path.join(os.tmpdir(), randomString(20))

    // should not exist yet
    fs.existsSync(targetDirectory).should.be.false

    var provider = new LocalFS({
      directory: targetDirectory
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      if(error) {
        throw error
      }

      // should have created target directory
      fs.existsSync(targetDirectory).should.be.true

      // file should have moved into directory
      fs.existsSync(targetFile).should.be.false
      fs.existsSync(url).should.be.true

      done()
    })
  })

  it('should store a file and use directory as function', function(done) {
    var targetDirectory = path.join(os.tmpdir(), randomString(20))

    // should not exist yet
    fs.existsSync(targetDirectory).should.be.false

    var provider = new LocalFS({
      directory: function () {
        return targetDirectory
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      if(error) {
        throw error
      }

      // should have created target directory
      fs.existsSync(targetDirectory).should.be.true

      // file should have moved into directory
      fs.existsSync(targetFile).should.be.false
      fs.existsSync(url).should.be.true

      done()
    })
  })

  it('should store a file and use directory as function with callback', function(done) {
    var targetDirectory = path.join(os.tmpdir(), randomString(20))

    // should not exist yet
    fs.existsSync(targetDirectory).should.be.false

    var provider = new LocalFS({
      directory: function (arg, callback) {
        callback(targetDirectory)
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      if(error) {
        throw error
      }

      // should have created target directory
      fs.existsSync(targetDirectory).should.be.true

      // file should have moved into directory
      fs.existsSync(targetFile).should.be.false
      fs.existsSync(url).should.be.true

      done()
    })
  })

  it('should store a file and bind the document to the directory function', function(done) {
    var targetDirectory = path.join(os.tmpdir(), randomString(20))
    var MyClass = function MyClass() {}

    // should not exist yet
    fs.existsSync(targetDirectory).should.be.false

    var provider = new LocalFS({
      directory: function (arg, callback) {
        this.should.instanceOf(MyClass)
        callback(targetDirectory)
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, new MyClass (), function(error, url) {
      if(error) {
        throw error
      }

      // should have created target directory
      fs.existsSync(targetDirectory).should.be.true

      // file should have moved into directory
      fs.existsSync(targetFile).should.be.false
      fs.existsSync(url).should.be.true

      done()
    })
  })

  it('should not store the file if an error received from directory callback ', function(done) {
    var targetDirectory = path.join(os.tmpdir(), randomString(20))

    // should not exist yet
    fs.existsSync(targetDirectory).should.be.false

    var provider = new LocalFS({
      directory: function (arg, callback) {
        callback(new Error('Some error occurs'))
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      should.exist(error)

      // should have created target directory
      fs.existsSync(targetDirectory).should.be.false

      // file should have moved into directory
      fs.existsSync(targetFile).should.be.true
      fs.existsSync(url).should.be.false

      done()
    })
  })

  it('should store a file and use path as function', function(done) {
    var dir = os.tmpdir()
    var pth = randomString(20)
    var targetDirectory = path.join(dir, pth)

    // should not exist yet
    fs.existsSync(targetDirectory).should.be.false

    var provider = new LocalFS({
      directory: dir,
      path: function () {
        return pth
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      if(error) {
        throw error
      }

      // should have created target directory
      fs.existsSync(targetDirectory).should.be.true

      // file should have moved into directory
      fs.existsSync(targetFile).should.be.false
      fs.existsSync(url).should.be.true

      done()
    })
  })

  it('should store a file and use path as function with callback', function(done) {
    var dir = os.tmpdir()
    var pth = randomString(20)
    var targetDirectory = path.join(dir, pth)

    // should not exist yet
    fs.existsSync(targetDirectory).should.be.false

    var provider = new LocalFS({
      directory: dir,
      path: function (arg, callback) {
        callback(pth)
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      if(error) {
        throw error
      }

      // should have created target directory
      fs.existsSync(targetDirectory).should.be.true

      // file should have moved into directory
      fs.existsSync(targetFile).should.be.false
      fs.existsSync(url).should.be.true

      done()
    })
  })

  it('should store a file and bind the document to the path function', function(done) {
    var dir = os.tmpdir()
    var pth = randomString(20)
    var targetDirectory = path.join(dir, pth)
    var MyClass = function MyClass() {}

    // should not exist yet
    fs.existsSync(targetDirectory).should.be.false

    var provider = new LocalFS({
      directory: dir,
      path: function (arg, callback) {
        this.should.instanceOf(MyClass)
        callback(pth)
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, new MyClass(), function(error, url) {
      if(error) {
        throw error
      }

      // should have created target directory
      fs.existsSync(targetDirectory).should.be.true

      // file should have moved into directory
      fs.existsSync(targetFile).should.be.false
      fs.existsSync(url).should.be.true

      done()
    })
  })

  it('should not store the file if an error received from path callback', function(done) {
    var dir = os.tmpdir()
    var pth = randomString(20)
    var targetDirectory = path.join(dir, pth)

    // should not exist yet
    fs.existsSync(targetDirectory).should.be.false

    var provider = new LocalFS({
      directory: dir,
      path: function (arg, callback) {
        callback(new Error('Some error occurs'))
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      should.exist(error)

      // should have created target directory
      fs.existsSync(targetDirectory).should.be.false

      // file should have moved into directory
      fs.existsSync(targetFile).should.be.true
      fs.existsSync(url).should.be.false

      done()
    })
  })

  // ==================

  it('should delete a file', function(done) {
    var provider = new LocalFS({
      directory: os.tmpdir()
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      if(error) {
        throw error
      }

      // file should have moved into directory
      fs.existsSync(url).should.be.true

      provider.remove({url: url}, undefined, function(error) {
        if(error) {
          throw error
        }

        // file should have been deleted
        fs.existsSync(url).should.be.false

        done()
      })
    })
  })

  it('should delete a file and use directory as function', function(done) {
    var provider = new LocalFS({
      directory: function () {
        return os.tmpdir()
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      if(error) {
        throw error
      }

      // file should have moved into directory
      fs.existsSync(url).should.be.true

      provider.remove({url: url}, undefined, function(error) {
        if(error) {
          throw error
        }

        // file should have been deleted
        fs.existsSync(url).should.be.false

        done()
      })
    })
  })

  it('should delete a file and use directory as function with callback', function(done) {
    var provider = new LocalFS({
      directory: function (arg, callback) {
        callback(os.tmpdir())
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      if(error) {
        throw error
      }

      // file should have moved into directory
      fs.existsSync(url).should.be.true

      provider.remove({url: url}, undefined, function(error) {
        if(error) {
          throw error
        }

        // file should have been deleted
        fs.existsSync(url).should.be.false

        done()
      })
    })
  })

  it('should delete a file and bind the document to the directory function', function(done) {
    var MyClass = function MyClass() {}

    var provider = new LocalFS({
      directory: function () {
        this.should.instanceOf(MyClass)
        return os.tmpdir()
      }
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, new MyClass (), function(error, url) {
      if(error) {
        throw error
      }

      // file should have moved into directory
      fs.existsSync(url).should.be.true

      provider.remove({url: url}, new MyClass (), function(error) {
        if(error) {
          throw error
        }

        // file should have been deleted
        fs.existsSync(url).should.be.false

        done()
      })
    })
  })

  it('should not delete a file if an error received from path callback', function(done) {
    var provider = new LocalFS({
      directory: os.tmpdir()
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, undefined, function(error, url) {
      if(error) {
        throw error
      }

      // file should have moved into directory
      fs.existsSync(url).should.be.true

      //
      provider._options.directory = function (arg, callback) {
        callback(new Error('Some error occurs'))
      }

      provider.remove({url: url}, undefined, function(error) {
        should.exist(error)

        // file should not have been deleted
        fs.existsSync(url).should.be.true

        done()
      })
    })
  })

  // ==================

  it('should not delete a file outside of our directory', function(done) {
    var targetDirectory = path.join(os.tmpdir(), randomString(20))

    var provider = new LocalFS({
      directory: targetDirectory
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    var sourceFile = path.resolve(__dirname + '/./fixtures/node_js_logo.png')
    var targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.remove({url: targetFile}, undefined, function(error) {
      // should have errored
      error.should.be.ok

      // file should not have been deleted
      fs.existsSync(targetFile).should.be.true

      done()
    })
  })
})
