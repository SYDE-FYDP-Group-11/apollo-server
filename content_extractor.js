const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
	getTitleFromArticle: async (url) => {
		const { data } = await axios.get(url)
		let $ = cheerio.load(data);

		let h1 = $('h1').text();
		if (h1 !== '' && h1 !== undefined && h1 !== null) {
			return h1;
		}

		let title = $('head > title').text();
  		return title
	}
}
