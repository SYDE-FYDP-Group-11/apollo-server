if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const express = require('express')
const twitter = require('./twitter')
const datanews = require('./datanews')
const document_parser = require('./document_parser')
const topic_extractor = require('./topic_extractor')

const app = express()
var port = process.env.PORT || 3000

app.get('/related_articles', (req, res) => {
	let tweet_id = req.query.tweet_id
	if (!tweet_id) return res.json({ error: 'Missing tweet_id query parameter.' })

	twitter.getTweet(tweet_id)
		.then(tweet => twitter.parseUrlFromTweet(tweet))
		.then(url => document_parser.getHtmlFromSite(url))
		.then(html => document_parser.getContentForTopicExtraction(html))
		.then(content => topic_extractor.getTopicsFromText(content, 5))
		.then(keywords => datanews.getArticlesByKeywords(keywords))
		.then(response => datanews.formatResponse(response))
		.then(result => res.json(result))
})

app.get('/sentiment_analysis', (req, res) => {
	let tweet_id = req.query.tweet_id
	if (!tweet_id) return res.json({ error: 'Missing tweet_id query parameter.' })

	twitter.getTweet(tweet_id)
		.then(tweet => twitter.parseUrlFromTweet(tweet))
		.then(url => document_parser.getHtmlFromSite(url))
		.then(html => document_parser.getArticleFromPage(html))
		.then(result => res.json(result)) // Display parsed content by Readability
})

app.get('/echo', (req, res) => {
	res.json({ headers: req.headers, body: req.body })
})

app.use(function (req, res) {
	res.status(404).send({ url: req.originalUrl + ' not found' })
})

app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
