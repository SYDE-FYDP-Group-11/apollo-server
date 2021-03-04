const language = require('@google-cloud/language')

const client = new language.LanguageServiceClient()

module.exports = {
	getSentimentFromArticle: async (article) => {
		const document = {
			content: article.textContent,
			type: 'PLAIN_TEXT'
		}
		
		const [result] = await client.analyzeSentiment({ document })

		return result.documentSentiment
	}
}
