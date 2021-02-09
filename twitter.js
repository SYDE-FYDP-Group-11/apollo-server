const Twitter = require('twitter-v2');

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET
});

module.exports = {
    getTweet: async (id) => {
        let tweets = await client.get('tweets', {
            ids: id,
            expansions: 'author_id',
            'tweet.fields': 'entities'
        })
        return tweets.data[0];
    },

    parseUrlFromTweet: (tweet) => {
        return tweet.entities.urls.map(url => url.unwound_url).filter(url => url)[0]
    }
}
