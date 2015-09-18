var env = process.env;

module.exports = {
	production: env.NODE_ENV === 'production',
	secret: '5Up3R53cR3T',
	algorithm: 'HS256',
	issuer: 'EaaS',
	expiration: null,//365*24*60*60,
	// TODO: These ones MUST be filled with your own keys
	sendgridAPIKey: env.SENDGRID_APIKEY,
	// This one is optional, if none is provided emails won't be backed up
	mongoURI: env.MONGOLAB_URI,
	emailsCollection: 'emails',
	errorsCollection: 'errors'
};