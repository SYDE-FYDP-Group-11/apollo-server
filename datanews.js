const axios = require('axios')

const datanews_url = 'http://api.datanews.io/v1/news'
const datanews_key = process.env.DATANEWS_KEY

const cleanTitle = (title) => {
	return title.toLowerCase().split(" - ")[0]
}

const deduplicateArticles = (articles, title, n) => {
	let viewed_titles = new Set([cleanTitle(title)])
	let deduplicated_articles = []

	for (const article of articles) {
		let cleaned_title = cleanTitle(article.title)
		if (!viewed_titles.has(cleaned_title)) {
			deduplicated_articles.push(article)
			viewed_titles.add(cleaned_title)
		}
		if (deduplicated_articles.length >= n)
			break
	}

	return deduplicated_articles
}

const formatResponse = (response) => {
	return response.map(article => {
		return {
			source: article.source,
			author: article.authors.join(', '),
			title: article.title,
			description: article.description,
			url: article.url,
			image: article.imageUrl,
			date: article.pubDate
		}
	})
}

module.exports = {
	getArticlesByKeywords: async (keywords, title) => {
		let query = keywords.join(' ')
		let { data } = await axios.get(
			datanews_url, {
				params: {
					q: query,
					sortBy: 'relevance',
					size: 15,
					language: 'en'
				},
				headers: {
					'x-api-key': datanews_key
				}
			}
		)
		let deduplicated_articles = deduplicateArticles(data.hits, title, 5)
		return formatResponse(deduplicated_articles)
	}
}
