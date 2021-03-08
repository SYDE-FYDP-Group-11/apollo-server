const language = require('@google-cloud/language')

const client = new language.LanguageServiceClient()

module.exports = {
	getSentimentFromArticle: async (article) => {
		const document = {
			content: article.textContent,
			type: 'PLAIN_TEXT'
		}
		
		const [result] = await client.analyzeSentiment({ document })

		score = result.documentSentiment.score
		magnitude = result.documentSentiment.magnitude
		label = ''

		if (score > 0.25) {
			label = 'Mostly Positive'
		}
		else if (score < -0.25) {
			label = 'Mostly Negative'
		}
		else if (magnitude > 3.0) {
			label = 'Mixed'
		}
		else {
			label = 'Neutral'
		}

		return { label: label, score: score }
	}
}
