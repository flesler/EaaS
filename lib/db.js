var config = require('./config'),
	db;

if (config.mongoURI) {
	require('mongodb').MongoClient.connect(config.mongoURI, function(err, _db) {
		if (err) console.warn('[WARN] MongoDB: Failed to connect ->', err.message);
		db = _db;
	});
}

function store(coll, data) {
	if (!db) return;

  data.now = new Date().toISOString();
  db.collection(coll).insert(data, function(err, res) {
		if (err) console.warn('[WARN] MongoDB: Failed to insert to', coll, '->', err.message);
  	// Do nothing
  });
}

exports.getEmailsByTo = function(to, done) {
	db.collection(config.emailsCollection).find({to:to}).toArray(function(err, docs) {
    done(err, docs);
  });
};

exports.storeEmail = function(data) {
	store(config.emailsCollection, data);
};

exports.storeError = function(data) {
	store(config.errorsCollection, data);
};