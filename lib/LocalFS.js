var util = require("util"),
	fs = require("fs"),
	path = require("path"),
	mkdirp = require("mkdirp"),
	async = require("async"),
	StorageProvider = require("mongoose-crate").StorageProvider;

var LocalFsStorageProvider = function(options) {
	StorageProvider.call(this);

	if(!options || !options.directory) {
		throw new Error("A directory to store files in must be specified");
	}

	this._options = options;
}
util.inherits(LocalFsStorageProvider, StorageProvider);

LocalFsStorageProvider.prototype.save = function(file, callback) {
	var target = path.join(this._options.directory, path.basename(file));

	async.series([function(callback) {
		// ensure that the output directory exists
		mkdirp(this._options.directory, callback);
	}.bind(this), function(callback) {
		// copy the file into the directory
		fs.rename(file, target, callback);
	}.bind(this)], function(error) {
		callback(error, target);
	});
};

LocalFsStorageProvider.prototype.remove = function(attachment, callback) {
	console.warn("LocalFsStorageProvider#remove not implemented yet..");
};

module.exports = LocalFsStorageProvider;
