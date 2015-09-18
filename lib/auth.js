var	jwt = require('jsonwebtoken'),
	config = require('./config');

exports.generateToken = function(subject) {
	return jwt.sign({}, config.secret, {
		algorithm: config.algorithm,
		issuer: config.issuer,
		expiresInSeconds: config.expiration,
		noTimestamp: true,
		subject: subject
	});
};

exports.validate = function(token, subject, done) {
	try {
		var data = jwt.verify(token, config.secret, {
			issuer: config.issuer,
			ignoreExpiration: !config.expiration
		});
		if (data.sub !== subject) {
			throw new Error('invalid subject');
		}
		done(null);
	} catch (err) {
		err.message = 'JWT: '+err.message;
		done(err);
	}
};