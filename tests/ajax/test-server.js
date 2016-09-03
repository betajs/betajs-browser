var Scoped = require(__dirname + "/../../vendors/scoped.js");
var BetaJS = require(__dirname + "/../../vendors/beta-noscoped.js");
	
var Express = require("express");

var logs = {};

var hosts = process.argv[2].split(",");
var ports = process.argv[3].split(",").map(function (x) { return parseInt(x, 10); });

ports.forEach(function (port) {
	
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
	
	express.get("/setcookie", function (request, response) {
		response.header('Content-Type', 'text/html');
		var cookiename = request.query.name;
		var cookievalue = request.query.value;
		response.cookie(cookiename, cookievalue, { maxAge: 900000, httpOnly: true });
		response.status(200).send('Set-Cookie: ' + cookiename + "=" + cookievalue);
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
			jsonp: "bool",
			postmessage: "bool",
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
				cookies: request.cookies,
				origin: request.headers.origin
			},
			response: {
				status: options.status
			}
		};
		
		if (log.id)
			logs[log.id] = log;
		
		console.log(log);
		
		if (options.cors) {
			response.header("Access-Control-Allow-Origin", request.headers.origin);
			//response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			response.header("Access-Control-Allow-Methods", "*");
			response.header("Access-Control-Allow-Credentials", options.corscreds ? "true" : "false");
		}

		if (log.options.jsonp) {
			response.header('Content-Type', 'text/html');
			response.status(log.response.status).send(log.request.query.jsonp + "(" + JSON.stringify(log) + ");");
		} else if (log.options.postmessage) {
			response.header('Content-Type', 'text/html');
			response.status(log.response.status).send("<!DOCTYPE html><script>parent.postMessage({'" + log.request.query.postmessage + "' : " + JSON.stringify(log) + " }, '*');</script>");
		} else {
			response.header('Content-Type', 'application/json');
			response.status(log.response.status).send(log);
		}
	});

	express.listen(port, function () {
		console.log("Listening on", port);
	});

});
