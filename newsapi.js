const NewsAPI = require('newsapi');

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

module.exports = {
	getArticleByKeywords: async (keywords) => {
		let news = await newsapi.v2.everything({
			q: keywords,
			sortBy: 'relevancy',
			pageSize: 5
		})
		return news;
	}
}
