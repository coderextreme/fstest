var port = process.env.PORT || 3000;

import express from 'express';
import fs from 'fs';
import https from 'https';

var app = express();

app.use(express.static('/'));
app.use(express.static('/dist'));
app.use(express.static('/index.html'));
app.use(express.static('/index.mjs'));

function send(res, data, type, next) {
	sendNoNext(res, data, type);
	next();
}

function sendNoNext(res, data, type) {
	try {
		if (!type.startsWith("image/")) {
			res.header("Content-Type", type);
		}
	} catch (e) {
		console.error(e);
	}
	res.send(data);
}

function magic(path, type) {
    app.get(path, function(req, res, next) {
	var url = req._parsedUrl.pathname;
	try {
		url = url.substr(1);
		console.error("Reading", url);
		var data = fs.readFileSync(url);
		if (type.startsWith("image") || type.startsWith("audio") || type.startsWith("video")) {
			sendNoNext(res, data, type);
		} else {
			sendNoNext(res, data.toString(), type);
		}
	} catch (e) {
		console.error(e, "Couldn't read", url);
		next();
	}
    });
}

magic("*.js", "text/javascript");
magic("*.mjs", "text/javascript");
magic("/*.xhtml", "application/xhtml+xml");
magic("/*.html", "text/html");

https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  requestCert: false,
  rejectUnauthorized: false
}, app)
.listen(3000, 'localhost', function () {
  console.log('Example app listening on port 3000! Go to https://localhost:3000/')
});
