const axios = require('axios')

const topic_service_url = 'https://topic-service-dot-apollo3.nn.r.appspot.com/'

module.exports = {
	getTopicsFromText: async (text, n) => {
		const { data } = await axios.get(
			topic_service_url, {
			params: {
				text: text,
				n: n
			}
		}
		)

		return data.topics
	}
}
