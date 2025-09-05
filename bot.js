require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const { OpenAIApi, Configuration } = require('openai');

// Twitter client setup
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Trending hashtags and links
const HASHTAGS = ['#solbear', '#solanamemecoin', '#solbearmemecoin', '#solbearcoin'];
const LINKS = [
  'https://solbearcoin.com',
  'https://pump.fun/coin/3UUK9M4es9tamJF4hk6Mh94UA78xKBxtfLCwxUjcpump',
  'https://x.com/solbearcoin',
  'https://t.me/SOLBEAROfficial',
];

// 1. Post a tweet with trending hashtags
async function postMarketingTweet() {
  const text = `Join the $SOLBEAR movement! ${HASHTAGS.join(' ')}\n${LINKS[0]}`;
  try {
    const { data } = await client.v2.tweet(text);
    console.log('Marketing tweet posted:', data);
  } catch (err) {
    console.error('Error posting marketing tweet:', err);
  }
}

// 2. Auto-reply to mentions
async function autoReplyMentions() {
  try {
    const mentions = await client.v2.userMentionTimeline('me', { max_results: 5 });
    for (const mention of mentions.data?.data || []) {
      const replyText = `Thanks for supporting $SOLBEAR! ${HASHTAGS[0]}`;
      await client.v2.reply(replyText, mention.id);
      console.log('Auto-replied to mention:', mention.id);
    }
  } catch (err) {
    console.error('Error auto-replying to mentions:', err);
  }
}

// 3. Scheduled tweets (every day at 12:00 UTC)
cron.schedule('0 12 * * *', () => {
  postMarketingTweet();
});

// 4. Simple AI: Generate tweet content (requires OpenAI API key in .env)
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
async function aiTweet(prompt) {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    const text = completion.data.choices[0].message.content;
    await client.v2.tweet(text);
    console.log('AI-generated tweet posted:', text);
  } catch (err) {
    console.error('Error generating AI tweet:', err);
  }
}

// 5. Auto-retweet community tweets with hashtags
async function autoRetweetHashtags() {
  try {
    const search = await client.v2.search(HASHTAGS.join(' OR '), { max_results: 5 });
    for (const tweet of search.data?.data || []) {
      await client.v2.retweet('me', tweet.id);
      console.log('Auto-retweeted:', tweet.id);
    }
  } catch (err) {
    console.error('Error auto-retweeting:', err);
  }
}

// 6. Welcome new followers (prints to console, can be extended to DM or tweet)
async function welcomeNewFollowers() {
  try {
    const followers = await client.v2.followers('me', { max_results: 5 });
    for (const user of followers.data?.data || []) {
      console.log(`Welcome @${user.username} to the $SOLBEAR community!`);
      // Optionally: send DM or tweet
    }
  } catch (err) {
    console.error('Error welcoming new followers:', err);
  }
}

// 7. Track hashtag usage (prints to console)
async function trackHashtagUsage() {
  try {
    const search = await client.v2.search(HASHTAGS.join(' OR '), { max_results: 10 });
    console.log('Recent hashtag usage:');
    for (const tweet of search.data?.data || []) {
      console.log(`@${tweet.author_id}: ${tweet.text}`);
    }
  } catch (err) {
    console.error('Error tracking hashtags:', err);
  }
}

// Example: Run all features once on startup
(async () => {
  await postMarketingTweet();
  await autoReplyMentions();
  await autoRetweetHashtags();
  await welcomeNewFollowers();
  await trackHashtagUsage();
})();
