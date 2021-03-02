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
			let json_ld_html = $('script[type="application/ld+json"]')[0] || $('script[type="application/ld+json"]')
			let json_ld = JSON.parse(json_ld_html.text)
			json_ld_date_modified = json_ld.dateModified
			json_ld_date_published = json_ld.datePublished
		} catch (e) {}

		let article_modified_time = $('meta[property="article:modified_time"]').attr('content')
		let article_published_time = $('meta[property="article:published_time"]').attr('content')
		let article_published = $('meta[name="article.published"]').attr('content')
		let bt_pubDate = $('meta[property="bt:pubDate"]').attr('content')
		let dc_date_issued = $('meta[name="DC.date.issued"]').attr('content')
		let pubdate = $('meta[name="pubdate"]').attr('content')

		let date = json_ld_date_modified || json_ld_date_published || article_modified_time || article_published_time || article_published || bt_pubDate || dc_date_issued || pubdate
		let image = $('meta[name="twitter:image"]').attr('content') || $('meta[name="twitter:image:src"]').attr('content')

		return [date, image]
	},

	getContentForTopicExtraction: async article => {
		let content = article.title
		if (article.textContent)
			content += (' ' + article.textContent.substring(0, 399))
		return content
	}
}
