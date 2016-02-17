var config = require('./config'),
	db;

function warn() {
	console.warn('[WARN] MongoDB:', [].join.call(arguments, ' '));
}

function getDB(done) {
	if (db) return done(db);
	if (!config.mongoURI) return warn('No DB configured!');

	require('mongodb').MongoClient.connect(config.mongoURI, function(err, _db) {
		if (err) return warn('Failed to connect ->', err.message);
		db = _db;
		done(db);
	});
}

function store(coll, data) {
	data.now = new Date().toISOString();
	getDB(function(db) {
		db.collection(coll).insert(data, function(err) {
			if (err) warn('Failed to insert to', coll, '->', err.message);
			// Do nothing
		});
	});
}

exports.getEmailsByTo = function(to, done) {
	getDB(function(db) {
		db.collection(config.emailsCollection).find({to:to}).toArray(done);
	});
};

exports.storeEmail = function(data) {
	store(config.emailsCollection, data);
};

exports.storeError = function(data) {
	store(config.errorsCollection, data);
};