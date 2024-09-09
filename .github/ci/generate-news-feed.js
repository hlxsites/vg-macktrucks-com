import { Feed } from 'feed';
import fs from 'fs';

/**
 * @typedef {Object} FeedConfig
 * @property {string} title
 * @property {string} description
 * @property {string} link
 * @property {string} siteRoot
 * @property {string} language

/**
 * @typedef {Object} Post
 * @property {string} title
 * @property {string} summary
 * @property {string} path
 * @property {string} publicationDate
 * @property {string} template
 */

/**
 * @param feed {FeedConfig}
 * @return {Promise<void>}
 */
async function createFeed() {
  let feedsConfigurations;

  async function getConfigs() {
    try {
      const ALL_FEEDS = await import('/generate-news-feed-config.js');
      feedsConfigurations = ALL_FEEDS;
    } catch (error) {
      console.error('Error importing or processing object:', error);
    }
  }
  getConfigs()

  for (const feed of feedsConfigurations) {
    const {
      ENDPOINT,
      FEED_INFO_ENDPOINT,
      TARGET_DIRECTORY,
      LIMIT,
    } = feed;
  
    const TARGET_FILE = `${TARGET_DIRECTORY}/feed.xml`;
    const PARSED_LIMIT = Number(LIMIT)
  
    const allPosts = await fetchBlogPosts(ENDPOINT, PARSED_LIMIT);
    console.log(`found ${allPosts.length} posts`);
  
    const feedMetadata = await fetchBlogMetadata(FEED_INFO_ENDPOINT);
  
    const newestPost = allPosts
      .map((post) => new Date(post.publicationDate * 1000))
      .reduce((maxDate, date) => (date > maxDate ? date : maxDate), new Date(0));
  
    const feed = new Feed({
      title: feedMetadata.title,
      description: feedMetadata.description,
      id: feedMetadata.link,
      link: feedMetadata.link,
      updated: newestPost,
      generator: 'AEM News feed generator (GitHub action)',
      language: feedMetadata.language,
    });
  
    allPosts.forEach((post) => {
      const link = feedMetadata["site-root"] + post.path;
      feed.addItem({
        title: post.title,
        id: link,
        link,
        content: post.summary,
        date: new Date(post.publicationDate * 1000),
        published: new Date(post.publicationDate * 1000),
      });
    });
  
    fs.writeFileSync(TARGET_FILE, feed.atom1());
    console.log('wrote file to ', TARGET_FILE);
  }

}

/**
 * @param feed {FeedConfig}
 * @return {Promise<Post[]>}
 */
async function fetchBlogPosts(endpoint, limit) {
  let offset = 0;
  const allPosts = [];

  while (true) {
    const api = new URL(endpoint);
    api.searchParams.append('offset', JSON.stringify(offset));
    api.searchParams.append('limit', limit);
    const response = await fetch(api, {});
    const result = await response.json();

    allPosts.push(...result.data);

    if (result.offset + result.limit < result.total) {
      // there are more pages
      offset = result.offset + result.limit;
    } else {
      break;
    }
  }
  return allPosts;
}

async function fetchBlogMetadata(infoEndpoint) {
  const infoResponse = await fetch(infoEndpoint);
  const feedInfoResult = await infoResponse.json();
  return feedInfoResult.data[0];
}

createFeed()
  .catch((e) => console.error(e));
