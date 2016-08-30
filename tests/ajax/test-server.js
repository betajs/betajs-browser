var Scoped = require(__dirname + "/../../vendors/scoped.js");
var BetaJS = require(__dirname + "/../../vendors/beta-noscoped.js");
	
var Express = require("express");

var logs = {};

[5000, 5001].forEach(function (port) {
	
	var express = Express();

	express.use(require("cookie-parser")());
	express.use(require("body-parser")());

	express.use("/static", Express["static"](__dirname + '/../..'));

	express.get('/logs/:id', function (request, response) {
		response.header('Content-Type', 'text/html');
		if (logs[request.params.id])
			response.status(200).send(JSON.stringify(logs[request.params.id]));
		else
			response.status(200).send('{}');
	});

	express.all('/request/:options/:path*?', function (request, response) {
		
		var path = "/" + (request.params.path || "") + (request.params['0'] || "");
		
		var options = {};
		request.params.options.split(",").forEach(function (option) {
			var kv = option.split(":");
			options[kv[0]] = kv[1];
		});
		options = BetaJS.Objs.extend({
			cors: false,
			id: undefined,
			status: 200
		}, BetaJS.Types.parseTypes(options, {		
			cors: "bool",
			status: "int"
		}));
		
		var log = {
			options: options,
			id: options.id,
			request: {
				path: path,
				method: request.method,
				query: request.query,
				body: request.body,
				cookies: request.cookies
			},
			response: {
				status: options.status
			}
		};
		
		if (log.id)
			logs[log.id] = log;
		
		console.log(log);
		
		response.header('Content-Type', 'application/json');

		if (options.cors) {
			response.header("Access-Control-Allow-Origin", "*");
			response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		}

		response.status(log.response.status).send(log);
	});

	express.listen(port, function () {
		console.log("Listening on", port);
	});

});
