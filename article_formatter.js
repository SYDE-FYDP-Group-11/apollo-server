module.exports = {
	formatArticleInfo: async (article, date_image) => {
		return {
			title: article.title,
			byline: article.byline,
			excerpt: article.excerpt,
			site: article.siteName,
			date: date_image[0],
			image: date_image[1]
		}
	}
}
