const axios = require('axios')
const { Readability } = require('@mozilla/readability')
const JSDOM = require('jsdom').JSDOM
const cheerio = require('cheerio')

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

	getDateAndImageFromPage: async html => {
		let $ = cheerio.load(html)

		let json_ld_date_modified, json_ld_date_published
		try {
			let json_ld = JSON.parse($('script[type="application/ld+json"]')[0].children[0].data)
			json_ld_date_modified = json_ld.dateModified
			json_ld_date_published = json_ld.datePublished
		} catch (e) {}

		let article_published = $('meta[name="article.published"]').attr('content')
		let bt_pubDate = $('meta[property="bt:pubDate"]').attr('content')
		let dc_date_issued = $('meta[name="DC.date.issued"]').attr('content')
		let pubdate = $('meta[name="pubdate"]').attr('content')

		let date = json_ld_date_modified || json_ld_date_published || article_published || bt_pubDate || dc_date_issued || pubdate
		let image = $('meta[name="twitter:image"]').attr('content')

		return [date, image]
	},

	getContentForTopicExtraction: async article => {
		let content = article.title
		if (article.textContent)
			content += (' ' + article.textContent.substring(0, 399))
		return content
	}
}
