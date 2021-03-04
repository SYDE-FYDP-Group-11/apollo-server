if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const express = require('express')
const twitter = require('./twitter')
const document_parser = require('./document_parser')
const article_formatter = require('./article_formatter')
const sentiment = require('./sentiment')
const topic_extractor = require('./topic_extractor')
const datanews = require('./datanews')

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
		res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'article_info', content: cached.article_info })}\n\n`)
		res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'sentiment_analysis', content: cached.sentiment_analysis })}\n\n`)
		res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'related_articles', content: cached.related_articles })}\n\n`)
		res.write('event: close\ndata:\n\n\n')
		res.end()
		return
	}

	let article_info, related_articles, sentiment_analysis
	twitter.getTweet(tweet_id)
		.then(tweet => twitter.parseUrlFromTweet(tweet))
		.then(url => document_parser.getHtmlFromSite(url))
		.then(html => [document_parser.getArticleFromPage(html), html])
		.then(article_html => {
			let article = article_html[0]
			let html = article_html[1]
			return Promise.all([
				document_parser.getDateAndImageFromPage(html)
					.then(date_image => article_formatter.formatArticleInfo(article, date_image))
					.then(result => {
						res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'article_info', content: result })}\n\n`)
						article_info = result
					}),

				sentiment.getSentimentFromArticle(article)
					.then(result => {
						res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'sentiment_analysis', content: result })}\n\n`)
						sentiment_analysis = result
					}),

				document_parser.getContentForTopicExtraction(article)
					.then(content => topic_extractor.getTopicsFromText(content, 5))
					.then(keywords => datanews.getArticlesByKeywords(keywords, article.title))
					.then(result => {
						res.write(`data: ${JSON.stringify({ tweet_id: tweet_id, type: 'related_articles', content: result })}\n\n`)
						related_articles = result
					})
			])
		})
		.then(() => cache.set(tweet_id, { article_info: article_info, sentiment_analysis: sentiment_analysis, related_articles: related_articles }))
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
