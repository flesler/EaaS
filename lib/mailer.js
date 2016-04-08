var config = require('./config'),
	nodemailer = require('nodemailer'),
	sg = require('nodemailer-sendgrid-transport'),
	sendgrid = nodemailer.createTransport(sg({
		auth:{api_key:config.sendgridAPIKey}
	}));

const IGNORE = /^(_id|token|x|y)$/;

exports.send = function(data, done) {
	var opts = {
		to: get(data, 'to'),
		from: {
			address: get(data, 'from', 'email'),
			name: get(data, 'name', 'nombre')
		},
		subject: get(data, 'subject', 'sujeto')
	};
	opts.replyTo = opts.from.address;

	var msg = get(data, 'message', 'mensaje');
	var lines = [];
	for (var key in data) {
		if (!IGNORE.test(key)) {
			lines.push(key+': '+data[key]);
		}
	}
	lines.push('');
	lines.push(msg);

	opts.text = lines.join('\n');
	opts.html = opts.text.replace(/\r?\n/g, '<br />');

	// Mailer can be changed from sendgrid to your own SMTP
	// By providing the connection URL in an SMTP_ env var
	var smtp = getSMTP(opts.to);
	var mailer = smtp ? nodemailer.createTransport(smtp) : sendgrid;

	mailer.sendMail(opts, function(err) {
		if (err) err.message = 'Mailer: '+err.message;
		done(err);
	});
};

function get(data, key, key2) {
	var val = data[key] || data[key2];
	delete data[key];
	delete data[key2];
	return val;
}

function getSMTP(to) {
	var hash = to.replace(/\W+/g, '_').toUpperCase();
	return config.smtps[hash];
}