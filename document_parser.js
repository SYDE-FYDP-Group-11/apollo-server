const axios = require('axios')
const { Readability } = require('@mozilla/readability')
const JSDOM = require('jsdom').JSDOM

module.exports = {
	getHtmlFromSite: async url => {
		const { data } = await axios.get(url)
		return data
	},

	getArticleFromPage: html => {
		let document = new JSDOM(html)
		let article = new Readability(document.window.document).parse()

		return article
	},

	getContentForTopicExtraction: async article => {
		let content = article.title
		if (article.excerpt) content += (' ' + article.excerpt)
		return content
	}
}
