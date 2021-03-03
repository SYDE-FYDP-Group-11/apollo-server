if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const express = require('express')
const twitter = require('./twitter')
const datanews = require('./datanews')
const sentiment = require('./sentiment')
const document_parser = require('./document_parser')
const topic_extractor = require('./topic_extractor')

const LRU = require("lru-cache")
const options = { max: 10, maxAge: 3.6e6 }
var cache = new LRU(options)

const app = express()
var port = process.env.PORT || 3000

app.get('/sse', function (req, res) {
	res.set({
		'Cache-Control': 'no-cache',
		'Content-Type': 'text/event-stream',
		'Connection': 'keep-alive',
		'X-Accel-Buffering': 'no'
	})
	res.flushHeaders()

	let tweet_id = req.query.tweet_id
	if (!tweet_id) {
		res.write(JSON.stringify({ error: 'Missing tweet_id query parameter.' }))
		res.end()
		return
	}

	var cached = cache.get(tweet_id)
	if (cached) {
		res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'sentiment_analysis', content: cached.sentiment_analysis })}\n\n`)
		res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'related_articles', content: cached.related_articles })}\n\n`)
		res.write('event: close\ndata:\n\n\n')
		res.end()
		return
	}

	let related_articles = ''
	let sentiment_analysis = ''
	twitter.getTweet(tweet_id)
		.then(tweet => twitter.parseUrlFromTweet(tweet))
		.then(url => document_parser.getHtmlFromSite(url))
		.then(html => document_parser.getArticleFromPage(html))
		.then(article => {
			return Promise.all([
				sentiment.getSentimentFromArticle(article)
					.then(result => {
						res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'sentiment_analysis', content: result })}\n\n`)
						sentiment_analysis = result
					}),

				document_parser.getContentForTopicExtraction(article)
					.then(content => topic_extractor.getTopicsFromText(content, 5))
					.then(keywords => datanews.getArticlesByKeywords(keywords))
					.then(result => {
						res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'related_articles', content: result })}\n\n`)
						related_articles = result
					})
			])
		})
		.then(() => cache.set(tweet_id, { sentiment_analysis: sentiment_analysis, related_articles: related_articles }))
		.then(() => res.write('event: close\ndata:\n\n\n'))
		.then(() => res.end())

	req.on('close', () => {
		res.write('event: close\ndata:\n\n\n')
		res.end()
	})
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
