if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const express = require('express')
const twitter = require('./twitter')
const newsapi = require('./newsapi')
const document_parser = require('./document_parser')
const topic_extractor = require('./topic_extractor')

const app = express()
var port = process.env.PORT || 3000

app.get('/sse', function (req, res) {
	res.set({
		'Cache-Control': 'no-cache',
		'Content-Type': 'text/event-stream',
		'Connection': 'keep-alive'
	})
	res.flushHeaders()

	let tweet_id = req.query.tweet_id
	if (!tweet_id) {
		res.write(JSON.stringify({ error: 'Missing tweet_id query parameter.' }))
		res.end()
		return
	}

	twitter.getTweet(tweet_id)
		.then(tweet => twitter.parseUrlFromTweet(tweet))
		.then(url => document_parser.getHtmlFromSite(url))
		.then(html => document_parser.getArticleFromPage(html))
		.then(article => {
			return Promise.all([
				document_parser.getContentForTopicExtraction(article)
					.then(content => topic_extractor.getTopicsFromText(content, 5))
					.then(keywords => newsapi.getArticlesByKeywords(keywords))
					.then(response => newsapi.formatResponse(response))
					.then(result => res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'related_articles', content: result })}\n\n`)),

				res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'sentiment_analysis', content: 'sad' })}\n\n`)
			])
		})
		.then(() => res.write('event: close\ndata:\n\n\n'))
		.then(() => res.end())
	
	req.on('close', () => {
		res.write('event: close\ndata:\n\n\n')
		res.end()
	})
})

// Legacy HTTP Request for Debugging
app.get('/related_articles', (req, res) => {
	let tweet_id = req.query.tweet_id
	if (!tweet_id) return res.json({ error: 'Missing tweet_id query parameter.' })

	twitter.getTweet(tweet_id)
		.then(tweet => twitter.parseUrlFromTweet(tweet))
		.then(url => document_parser.getHtmlFromSite(url))
		.then(html => document_parser.getArticleFromPage(html))
		.then(article => document_parser.getContentForTopicExtraction(article))
		.then(content => topic_extractor.getTopicsFromText(content, 5))
		.then(keywords => newsapi.getArticlesByKeywords(keywords))
		.then(response => newsapi.formatResponse(response))
		.then(result => res.json(result))
})

// Legacy HTTP Request for Debugging
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
