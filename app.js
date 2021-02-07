if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require("express");
const fs = require('fs');
const twitter = require('./twitter');
const newsapi = require('./newsapi');
const content_extractor = require('./content_extractor');

const app = express();
var port = process.env.PORT || 3000;

app.get("/api", (req, res) => {
	let url = req.query.url;
	if (!url) return res.json({error: `Missing url query parameter.`})
	fs.readFile('examples.json', (err, data) => {
		if (err) throw err;
		let testExamples = JSON.parse(data);
		let example = testExamples[url];
		if (example) res.json(example)
		else res.json({error: `No information is available for ${url}.`})
	});
});

app.get("/tweetlinks", (req, res) => {
	(async () => {
		let id = req.query.id || "1349441195496374275";
		if (!id) return res.json({error: `Missing id query parameter.`})
		tweet = await twitter.getTweet(id)
		res.json(tweet.entities.urls.map(url => url.unwound_url).filter(url => url))
	})()
});

app.get("/title", (req, res) => {
	(async () => {
		let url = req.query.url;
		title = await content_extractor.getTitleFromArticle(url)
		res.json(title)
	})()
});

app.get("/newsapi", (req, res) => {
	(async () => {
		let keywords = req.query.keywords;
		news = await newsapi.getArticleByKeywords(keywords)
		res.json(news)
	})()
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
