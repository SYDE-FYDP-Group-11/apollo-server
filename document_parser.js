const axios = require('axios')
const cheerio = require('cheerio')
const { Readability } = require('@mozilla/readability')
const JSDOM = require('jsdom').JSDOM

module.exports = {
	getHtmlFromSite: async (url) => {
		const { data } = await axios.get(url)
		return data
	},

	getContentForTopicExtraction: (html) => {
		let content = module.exports.getTitleFromPage(html)

		let article = module.exports.getArticleFromPage(html)
		if (article && article.excerpt) {
			content += (' ' + article.excerpt)
		}

		return content
	},

	getArticleFromPage: (html) => {
		let document = new JSDOM(html)
		let article = new Readability(document.window.document).parse()

		return article
	},

	getTitleFromPage: (html) => {
		let $ = cheerio.load(html)

		let h1 = $('h1').text()
		if (h1 !== '' && h1 !== undefined && h1 !== null) {
			return h1
		}

		let title = $('head > title').text()
		return title
	}
}
