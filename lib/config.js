var env = process.env;

module.exports = {
	production: env.NODE_ENV === 'production',
	secret: '5Up3R53cR3T',
	algorithm: 'HS256',
	issuer: 'EaaS',
	expiration: null,//365*24*60*60,
	// TODO: This one must be filled with your own
	sendgridAPIKey: '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'
};