import { Feed } from "feed";
import fs from "fs";

const limit = 1000;
const endpoint = `https://main--vg-macktrucks-com--hlxsites.hlx.live/mack-news/feed.json`;
const feedInfoEndpoint = `https://main--vg-macktrucks-com--hlxsites.hlx.live/mack-news/feed-info.json`;
const targetDirectory = '../../mack-news';
const targetFile = targetDirectory + "/feed.xml";

async function main() {
    let offset = 0;
    let allPosts = [];

    while (true) {
        const api = new URL(endpoint);
        api.searchParams.append('offset',  JSON.stringify(offset));
        api.searchParams.append('limit', limit);
        const response = await fetch(api, {});
        const result = await response.json()

        allPosts.push(...result.data)

        if (result.offset + result.limit < result.total){
            // there are more pages
            offset = result.offset + result.limit;
        } else {
            break;
        }
    }

    console.log(`found ${allPosts.length} posts`);

    const infoResponse = await fetch(feedInfoEndpoint, {});
    const feedInfoResult = await infoResponse.json();
    const feedInfo = feedInfoResult.data[0];

    const newestPost = allPosts
        .map(post => new Date(post.publicationDate * 1000))
        .reduce((maxDate, date) => {
            return date > maxDate ? date : maxDate;
    }, new Date(0));


    const feed = new Feed({
        title: feedInfo.title,
        description: feedInfo.description,
        id: feedInfo.link,
        link: feedInfo.link,
        updated: newestPost,
        generator: "Mack Trucks RSS generator (GitHub action)",
        language: feedInfo.lang, // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    });

    allPosts.forEach(post => {

        const link = "https://www.macktrucks.com"+post.path;
        feed.addItem({
            title: post.title,
            id: link,
            link: link,
            content: post.summary,
            date:  new Date(post.publicationDate * 1000),
        });
    });

    if (!fs.existsSync(targetDirectory)){
        fs.mkdirSync(targetDirectory);
    }
    fs.writeFileSync(targetFile, feed.rss2());
    console.log("wrote file to ", targetFile)
}

main()
    .catch((e) => console.error(e));
