const http = require('http');
const url = require('url');
const express = require("express");
const fs = require('fs');
const app = express();
var port = process.env.PORT || 3000;

app.get("/api", (req, res) => {
	let url = req.query.url;
	if (!url) return res.status(404).send({error: `Missing url query parameter.`})
	fs.readFile('examples.json', (err, data) => {
		if (err) throw err;
		let testExamples = JSON.parse(data);
		let example = testExamples[url];
		if (example) res.json(example)
		else res.status(404).send({error: `No information is available for ${url}.`})
	});
});

app.get("/template", (req, res) => {
	res.json({
		highCoverage: "Boolean?",
		highPublisherQuality: "Boolean?",
		publisherBias: "Integer?",
		notSatire: "Boolean?",
		evidenceCited: "Boolean?",
		authorVerified: "Boolean?",
		imagesManipulated: "Integer?",
		urlNotSuspicious: "Boolean?",
		headlineNotSuspicious: "Boolean?"
	});
});

app.get("/newsapi", (req, res) => {
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
