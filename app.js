const http = require('http');
const url = require('url');
const express = require("express");
const app = express();
var port = process.env.PORT || 3000;

app.get("/1", (req, res) => {
	res.json({
		topicCoverage: 1,
		publisherQuality: 1,
		publisherBias: "Right",
		satire: true,
		evidenceCited: true,
		authorVerified: true,
		imageManipulated: true,
		urlSuspicious: true,
		headlineSuspicious: true
	});
});

app.get("/2", (req, res) => {
	res.json({
		topicCoverage: 5,
		publisherQuality: 5,
		publisherBias: "Left",
		satire: false,
		evidenceCited: false,
		authorVerified: false,
		imageManipulated: false,
		urlSuspicious: false,
		headlineSuspicious: false
	});
});

app.get("/news", (req, res) => {
	let q = req.query.q;
	var requestUrl = url.parse(url.format({
		protocol: 'http',
		hostname: 'newsapi.org',
		pathname: '/v2/everything',
		query: {
			q: q,
			from: new Date().toISOString().split('T')[0],
			sortBy: 'relevancy',
			pageSize: '1',
			apiKey: process.env.NEWS_API_KEY
		}
	}));
	http.get(requestUrl, (resp) => {
		let data = '';
		resp.on('data', (chunk) => {
			data += chunk;
		});
		resp.on('end', () => {
			res.json(JSON.parse(data));
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
});

app.get("/echo", (req, res) => {
	res.json({headers: req.headers, body: req.body});
});

app.use(function(req, res) {
	res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
