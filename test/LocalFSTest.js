'use strict'

require('should')
const crypto = require('crypto')
const os = require('os')
const fs = require('fs')
const path = require('path')
const describe = require('mocha').describe
const it = require('mocha').it
const LocalFS = require('../')
const randomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}

describe('LocalFS', () => {
  it('should object strenuously if target directory is not specified', (done) => {
    (() => new LocalFS()).should.throw()

    done()
  })

  it('should override path function', () => {
    const fn = (attachment) => {

    }
    const storage = new LocalFS({
      path: fn,
      directory: os.tmpdir()
    })

    storage._options.path.should.equal(fn)
  })

  it('should store a file', (done) => {
    const targetDirectory = path.join(os.tmpdir(), randomString(20))

    // should not exist yet
    fs.existsSync(targetDirectory).should.be.false

    const provider = new LocalFS({
      directory: targetDirectory
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    const sourceFile = path.resolve(path.join(__dirname, '.', 'fixtures', 'node_js_logo.png'))
    const targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, (error, url) => {
      if (error) {
        return done(error)
      }

      // should have created target directory
      fs.existsSync(targetDirectory).should.be.true

      // file should have moved into directory
      fs.existsSync(targetFile).should.be.false
      fs.existsSync(url).should.be.true

      done()
    })
  })

  it('should delete a file', (done) => {
    const provider = new LocalFS({
      directory: os.tmpdir()
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    const sourceFile = path.resolve(path.join(__dirname, '.', 'fixtures', 'node_js_logo.png'))
    const targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.save({
      path: targetFile
    }, (error, url) => {
      if (error) {
        throw error
      }

      // file should have moved into directory
      fs.existsSync(url).should.be.true

      provider.remove({url: url}, (error) => {
        if (error) {
          return done(error)
        }

        // file should have been deleted
        fs.existsSync(url).should.be.false

        done()
      })
    })
  })

  it('should not delete a file outside of our directory', (done) => {
    const targetDirectory = path.join(os.tmpdir(), randomString(20))

    const provider = new LocalFS({
      directory: targetDirectory
    })

    // make a copy of the file so we don't delete it from the fixtures directory
    const sourceFile = path.resolve(path.join(__dirname, '.', 'fixtures', 'node_js_logo.png'))
    const targetFile = path.join(os.tmpdir(), randomString(20))

    fs.existsSync(sourceFile).should.be.true
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile))
    fs.existsSync(targetFile).should.be.true

    provider.remove({url: targetFile}, (error) => {
      // should have errored
      error.should.be.ok

      // file should not have been deleted
      fs.existsSync(targetFile).should.be.true

      done()
    })
  })

  it('should not store a file outside of our directory', (done) => {
    const targetDirectory = path.join(os.tmpdir(), randomString(20))

    const provider = new LocalFS({
      directory: targetDirectory,
      path: (attachment) => `../${attachment.path}`
    })

    provider.save({url: 'foo.txt'}, (error) => {
      // should have errored
      error.should.be.ok
      error.message.should.equal('Will only store files under our storage directory')

      done()
    })
  })

  it('should not remove an attachment with no path', (done) => {
    const targetDirectory = path.join(os.tmpdir(), randomString(20))

    const provider = new LocalFS({
      directory: targetDirectory
    })

    provider.remove({url: null}, done)
  })

  it('should survive deleting non-existant files', (done) => {
    const targetDirectory = path.join(os.tmpdir(), randomString(20))
    const provider = new LocalFS({
      directory: targetDirectory
    })
    const targetFile = path.join(targetDirectory, 'foo.txt')

    provider.remove({url: targetFile}, done)
  })
})
