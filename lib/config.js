var 
	env = process.env,
	smtps = {};

module.exports = {
	production: env.NODE_ENV === 'production',
	secret: env.SECRET || '5Up3R53cR3T',
	algorithm: 'HS256',
	issuer: 'EaaS',
	expiration: null,//365*24*60*60,
	// TODO: These ones MUST be filled with your own keys
	sendgridAPIKey: env.SENDGRID_APIKEY,
	smtps: smtps,
	// This one is optional, if none is provided emails won't be backed up
	mongoURI: env.MONGOLAB_URI,
	emailsCollection: 'emails',
	errorsCollection: 'errors'
};

// SMTP handlers for certain emails can be provided in env vars
// Key must be SMTP_USER_GMAIL_COM=smtps://user%40gmail.com:pass@smtp.gmail.com
for (var key in env) {
	if (key.slice(0, 5) === 'SMTP_') {
		smtps[key.slice(5)] = env[key];
	}
}