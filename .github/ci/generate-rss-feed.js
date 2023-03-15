const limit = 1000;
const endpoint = `https://main--vg-macktrucks-com--hlxsites.hlx.page/mack-news/feed.json`;

async function main() {
    let offset = 0;
    let allPages = [];

    while (true) {
        const api = new URL(endpoint);
        api.searchParams.append('offset',  JSON.stringify(offset));
        api.searchParams.append('limit', limit);
        const response = await fetch(api, {});
        const result = await response.json()

        allPages.push(...result.data)

        if (result.offset + result.limit < result.total){
            // there are more pages
            offset = result.offset + result.limit;
        } else {
            break;
        }
    }

    console.log(`found ${allPages.length} pages`);
}

main()
    .catch((e) => console.error(e));
