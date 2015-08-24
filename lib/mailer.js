var config = require('./config'),
	sendgrid = require('sendgrid')(config.sendgridAPIKey);

exports.send = function(data, done) {
	var params = {
		to: get(data, 'to'),
		from: get(data, 'from'),
		fromname: get(data, 'name'),
		subject: get(data, 'subject')
	};

	var msg = get(data, 'message');
	var lines = [];
	for (var key in data) {
		lines.push(key+': '+data[key]);
	}
	lines.push(msg);

	params.text = lines.join('\n');
	sendgrid.send(params, done);
};

function get(data, key) {
	var val = data[key];
	delete data[key];
	return val;
}
