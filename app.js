if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require("express");
const twitter = require('./twitter');
const newsapi = require('./newsapi');
const content_extractor = require('./content_extractor');
const topic_extractor = require('./topic_extractor');

const app = express();
var port = process.env.PORT || 3000;

app.get("/related_articles", (req, res) => {
	let tweet_id = req.query.tweet_id;
	if (!tweet_id) return res.json({ error: `Missing tweet_id query parameter.` })

	twitter.getTweet(tweet_id)
		.then(tweet => twitter.parseUrlFromTweet(tweet))
		.then(url => content_extractor.getTitleFromArticle(url))
		.then(title => topic_extractor.getTopicsFromText(title, 6))
		.then(keywords => newsapi.getArticlesByKeywords(keywords))
		.then(response => newsapi.formatResponse(response))
		.then(result => res.json(result))
});

app.get("/echo", (req, res) => {
	res.json({ headers: req.headers, body: req.body });
});

app.use(function (req, res) {
	res.status(404).send({ url: req.originalUrl + ' not found' })
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
