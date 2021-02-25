const axios = require('axios')

const datanews_url = 'http://api.datanews.io/v1/news'
const datanews_key = process.env.DATANEWS_KEY

module.exports = {
	getArticlesByKeywords: async (keywords) => {
		let query = keywords.join(' ')
		let { data } = await axios.get(
			datanews_url, {
				params: {
					q: query,
					sortBy: 'relevance',
					size: 5,
					language: 'en'
				},
				headers: {
					'x-api-key': datanews_key
				}
			}
		)
		return data
	},

	formatResponse: (response) => {
		articles = response.hits.map(article => {
			return {
				source: article.source.name,
				author: article.authors.join(', '),
				title: article.title,
				description: article.description,
				url: article.url,
				image: article.imageUrl,
				date: article.pubDate
			}
		})
		return articles
	}
}
