var config = require('./config'),
	sendgrid = require('sendgrid')(config.sendgridAPIKey);

exports.send = function(data, done) {
	var params = {
		to: get(data, 'to'),
		from: get(data, 'from', 'email'),
		fromname: get(data, 'name', 'nombre'),
		subject: get(data, 'subject', 'sujeto')
	};

	var msg = get(data, 'message', 'mensaje');
	var lines = [];
	for (var key in data) {
		if (key !== 'token') {
			lines.push(key+': '+data[key]);
		}
	}
	lines.push('');
	lines.push(msg);

	params.text = lines.join('\n');
	params.html = params.text.replace(/\r?\n/g, '<br />');
	sendgrid.send(params, function(err) {
		if (err) err.message = 'SendGrid: '+err.message;
		done(err);
	});
};

function get(data, key, key2) {
	var val = data[key] || data[key2];
	delete data[key];
	delete data[key2];
	return val;
}
