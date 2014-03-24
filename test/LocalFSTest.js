var should = require("should"),
	crypto = require("crypto"),
	os = require("os"),
	fs = require("fs"),
	path = require("path"),
	LocalFS = require("../lib/LocalFS");

function randomString(length) {
	return crypto.randomBytes(Math.ceil(length/2))
		.toString("hex")
		.slice(0, length);
}

describe("LocalFS", function() {

	it("should object strenuously if target directory is not specified", function(done) {
		(function() {
			new LocalFS();
		}).should.throw();

		done();
	})

	it("should store a file", function(done) {
		var targetDirectory = path.join(os.tmpdir(), randomString(20));

		// should not exist yet
		fs.existsSync(targetDirectory).should.be.false;

		var provider = new LocalFS({
			directory: targetDirectory
		});

		// make a copy of the file so we don't delete it from the fixtures directory
		var sourceFile = path.resolve(__dirname + "/./fixtures/node_js_logo.png");
		var targetFile = path.join(os.tmpdir(), randomString(20));

		fs.existsSync(sourceFile).should.be.true;
		fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
		fs.existsSync(targetFile).should.be.true;

		provider.createOrUpdate(targetFile, function(error, url) {
			if(error) {
				throw error;
			}

			// should have created target directory
			fs.existsSync(targetDirectory).should.be.true;

			// file should have moved into directory
			fs.existsSync(targetFile).should.be.false;
			fs.existsSync(url).should.be.true;

			done();
		});
	})
})
