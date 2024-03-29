const axios = require('axios')
const { Readability } = require('@mozilla/readability')
const JSDOM = require('jsdom').JSDOM
const cheerio = require('cheerio')

const getDateFromPage = ($) => {
	let json_ld_date_modified, json_ld_date_published, json_ld
	try {
		try {
			let json_ld_html = $('script[type="application/ld+json"]')[0] || $('script[type="application/ld+json"]') || $('script[type="application/ld+json"]')[0].children[0]
			json_ld = JSON.parse(json_ld_html.text)
		} catch (e) {}
		
		if (!json_ld) {
			let json_ld_html = $('script[type="application/ld+json"]')[0].children[0].data
			json_ld = JSON.parse(json_ld_html)
		}

		json_ld_date_modified = json_ld.dateModified
		json_ld_date_published = json_ld.datePublished
	} catch (e) {}

	let article_modified_time1 = $('meta[property="article:modified_time"]').attr('content')
	let article_published_time1 = $('meta[property="article:published_time"]').attr('content')
	let article_modified_time2 = $('meta[name="article:modified_time"]').attr('content')
	let article_published_time2 = $('meta[name="article:published_time"]').attr('content')
	let article_modified = $('meta[property="article:modified"]').attr('content')
	let article_published1 = $('meta[property="article:published"]').attr('content')
	let article_published2 = $('meta[name="article.published"]').attr('content')
	let bt_pubDate = $('meta[property="bt:pubDate"]').attr('content')
	let dc_date_issued = $('meta[name="DC.date.issued"]').attr('content')
	let pubdate = $('meta[name="pubdate"]').attr('content')
	let last_modified = $('meta[name="last-modified"]').attr('content')

	return json_ld_date_modified || json_ld_date_published || article_modified_time1 || article_published_time1 || article_modified_time2 || article_published_time2 || article_modified || article_published1 || article_published2 || bt_pubDate || dc_date_issued || pubdate || last_modified
}

const getImageFromPage = ($) => {
	return $('meta[name="twitter:image"]').attr('content') || $('meta[name="twitter:image:src"]').attr('content') || $('meta[property="og:image"]').attr('content')
}

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

	getPageElements: html => {
		let $ = cheerio.load(html)
		return {date: getDateFromPage($), image: getImageFromPage($)}
  },

	getContentForTopicExtraction: article => {
		let content = article.title
		if (article.textContent)
			content += (' ' + article.textContent.substring(0, 399))
		return content
	}
}
