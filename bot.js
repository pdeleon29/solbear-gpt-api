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

// 1. Scheduled AI-Generated Tweets
async function postAIGeneratedTweet() {
  try {
    const prompt = `Write a fun, hype tweet about $SOLBEAR, a Solana meme coin. Include one or more of these hashtags: ${HASHTAGS.join(', ')}. Mention the community and the website: ${LINKS[0]}`;
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    const text = completion.data.choices[0].message.content;
    const { data } = await client.v2.tweet(text);
    console.log('AI-generated tweet posted:', data);
  } catch (err) {
    console.error('Error posting AI-generated tweet:', err);
  }
}

// 2. Auto-reply to mentions with AI
async function autoReplyMentionsWithAI() {
  try {
    const mentions = await client.v2.userMentionTimeline('me', { max_results: 5 });
    for (const mention of mentions.data?.data || []) {
      const prompt = `Reply to this tweet in a fun, friendly, and meme-coin style. Tweet: "${mention.text}". Use $SOLBEAR branding and hashtags.`;
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });
      const replyText = completion.data.choices[0].message.content;
      await client.v2.reply(replyText, mention.id);
      console.log('AI auto-replied to mention:', mention.id);
    }
  } catch (err) {
    console.error('Error auto-replying to mentions with AI:', err);
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

// 3. Community Engagement: Like, retweet, and reply to tweets with your hashtags
async function engageWithCommunity() {
  try {
    const search = await client.v2.search(HASHTAGS.join(' OR '), { max_results: 5 });
    for (const tweet of search.data?.data || []) {
      // Like
      await client.v2.like('me', tweet.id);
      // Retweet
      await client.v2.retweet('me', tweet.id);
      // AI reply
      const prompt = `Reply to this tweet as the $SOLBEAR meme coin mascot. Tweet: "${tweet.text}". Use humor and hashtags.`;
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });
      const replyText = completion.data.choices[0].message.content;
      await client.v2.reply(replyText, tweet.id);
      console.log('Engaged with community tweet:', tweet.id);
    }
  } catch (err) {
    console.error('Error engaging with community:', err);
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

// 5. Trending Hashtag Monitor: Print trending topics related to Solana/meme coins
async function monitorTrendingHashtags() {
  try {
    // Twitter API v2 does not provide direct trending topics, so this is a placeholder for future expansion.
    // For now, just print recent tweets with your hashtags.
    const search = await client.v2.search(HASHTAGS.join(' OR '), { max_results: 10 });
    console.log('Recent hashtag usage:');
    for (const tweet of search.data?.data || []) {
      console.log(`@${tweet.author_id}: ${tweet.text}`);
    }
  } catch (err) {
    console.error('Error monitoring trending hashtags:', err);
  }
}

// Example: Run prioritized features on startup and schedule AI tweets
(async () => {
  await postAIGeneratedTweet();
  await autoReplyMentionsWithAI();
  await engageWithCommunity();
  await monitorTrendingHashtags();
})();

// Schedule AI-generated tweets every 6 hours
cron.schedule('0 */6 * * *', () => {
  postAIGeneratedTweet();
});
