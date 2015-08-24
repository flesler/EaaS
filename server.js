var http = require('http'),
	router = require('./lib/router');

var server = http.createServer(router).listen(process.env.PORT || 8080, function(){
	console.log('EaaS server listening on port ' + server.address().port);
});