module.exports = {
	formatArticleInfo: (article, url, date, image) => {
		return {
			title: article.title,
			byline: article.byline,
			excerpt: article.excerpt,
			site: article.siteName,
			url: url,
			date: date,
			image: image
		}
	}
}
