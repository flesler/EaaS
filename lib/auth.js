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

const HEADER = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.';

exports.validate = function(token, subject, done) {
	// Implicit default header
	if (token.split('.').length === 2) {
		token = HEADER + token;
	}

	try {
		var data = jwt.verify(token, config.secret, {
			algorithms: [config.algorithm],
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