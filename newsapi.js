const NewsAPI = require('newsapi');

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

module.exports = {
	getArticlesByKeywords: async (keywords) => {
		console.log(keywords)
		let news = await newsapi.v2.everything({
			q: keywords,
			sortBy: 'relevancy',
			pageSize: 5
		})
		return news;
	},

	formatResponse: (response) => {
		articles = response.articles.map(article => {
			return {
				source: article.source.name,
				author: article.author,
				title: article.title,
				description: article.description,
				url: article.url,
				image: article.urlToImage,
				publishedAt: article.publishedAt
			}
		})
		return articles
	}
}