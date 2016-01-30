var parseURL = require('url').parse,
	resolveURL = require('url').resolve,
	http = require('http'),
	config = require('./config'),
	formBody = require('body/form'),
	auth = require('./auth'),
	db = require('./db'),
	csv = require('./csv'),
	mailer = require('./mailer');

module.exports = function(req, res) {
	res.req = req;
	var url = parseURL(req.url, true);
	var route = req.method + ' ' + url.pathname;
	var q = url.query;
	var prod = config.production;
	switch (route) {
		// Good idea to ping with image within form, to ensure it's awake
		case 'GET /ping':
		case 'GET /favicon.ico':
		case 'GET /robots.txt':
			reply(res, 204, '');
			break;
		// Generate an auth token for a certain receiver
		case 'GET /token':
			// Only accessible in development
			if (prod) return reply(res, 404);

			var token = auth.generateToken(q.to);
			reply(res, 200, token);
			break;
		// Handle form submissions
		case 'POST /form':
			formBody(req, {}, function(err, body) {
				req.body = body;
				if (err) return reply(res, 400, err.message);
				if (q.token) body.token = q.token;
				// If enabled, backup emails to mongoDB
				if (prod) db.storeEmail(body);

				auth.validate(body.token, body.to, function(err) {
					if (err) return reply(res, 401, err.message);
					mailer.send(body, function(err) {
						if (err) return reply(res, 500, err.message);
						if (q.redir) {
							redirect(res, q.redir);
						} else {
							reply(res, 204, '');
						}
					});
				});
			});
			break;
		case 'GET /export':
			// Only accessible in development
			if (prod) return reply(res, 404);
			auth.validate(q.token, q.to, function(err) {
				if (err) return reply(res, 401, err.message);
				db.getEmailsByTo(q.to, function(err, rows) {
					if (err) return reply(res, 500, err.message);
					var filename = q.to.split('@')[0] + '.csv';
					res.setHeader('Content-Disposition', 'attachment; filename='+filename);
					reply(res, 200, csv.from(rows));
				});
			});
			break;
		case 'GET /test':
			// Only accessible in development
			if (prod) return reply(res, 404);
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
	var error = status >= 400;
	if (typeof msg !== 'string') {
		msg = http.STATUS_CODES[status] || '';
	}

	var ref = req.headers.referer || '-';
	if (config.production && error) {
		db.storeError({referer:ref, url:req.url, method:req.method, status:status, msg:msg, body:req.body});
	}

	var type = error ? 'warn' : 'log';
	console[type]('['+type.toUpperCase()+']', ref, req.method, req.url, status, msg.split(/\r?\n/)[0]);
	res.writeHead(status, {'Content-Length':Buffer.byteLength(msg)});
	res.end(msg);
}

function redirect(res, redir) {
	var req = res.req;
	var from = req.headers.referer || 'http://'+req.headers.host;
	var url = resolveURL(from, redir);
	console.log(req.method, req.url, 302, url);
	res.writeHead(302, {Location:url,'Content-Length':0});
	res.end();
}