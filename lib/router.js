var parseURL = require('url').parse,
	resolveURL = require('url').resolve,
	config = require('./config'),
	formBody = require('body/form'),
	auth = require('./auth'),
	mailer = require('./mailer');

module.exports = function(req, res) {
	res.req = req;
	var url = parseURL(req.url, true);
	var route = req.method + ' ' + url.pathname;
	var q = url.query;
	switch (route) {
		// Good idea to ping with image within form, to ensure it's awake
		case 'GET /ping':
		case 'GET /favicon.ico':
			reply(res, 200);
			break;
		// Generate an auth token for a certain receiver
		case 'GET /token':
			// Only accessible in development
			if (config.production) return reply(res, 404);

			var token = auth.generateToken(q.to);
			reply(res, 200, token);
			break;
		// Handle form submissions
		case 'POST /form':
			formBody(req, {}, function(err, body) {
				if (err) return reply(res, 400, err.message);
				auth.validate(url.query.token, body.to, function(err) {
					if (err) return reply(res, 401, err.message);
					mailer.send(body, function(err) {
						if (err) return reply(res, 500, err.message);
						if (q.redir) {
							redirect(res, q.redir);
						} else {
							reply(res, 200);
						}
					});
				});
			});
			break;
		case 'GET /test':
			// Only accessible in development
			if (config.production) return reply(res, 404);

			var html = require('fs').readFileSync('static/test.html', {encoding:'utf8'});
			reply(res, 200, html);
			break;
		default:
			reply(res, 404);
			break;
	}
};

function reply(res, status, msg) {
	var req = res.req;
	console.log(req.method, req.url, status, msg);
	res.writeHead(status);
	res.end(msg);
}

function redirect(res, redir) {
	var req = res.req;
	var url = resolveURL(req.url, redir);
	console.log(req.method, req.url, 302, url);
	res.writeHead(302, {Location:url});
	res.end();
}