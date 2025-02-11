// import { gotScraping } from 'got-scraping';
import * as cheerio from 'cheerio';
import { parse } from 'node:querystring';
import { readableToString2 } from 'src/utils/utils';

const SCRAPPERAPI_API_KEY =
  process.env.SCRAPPERAPI_API_KEY || 'c24d9ac58e3e1edfa9223cbae442da38';
const GOOGLE_SCHOLAR_URL = 'https://scholar.google.com';

export const handler = async (event) => {
  try {
    const name = event.queryStringParameters?.name;
    console.log(name);
    if (!name) throw new Error('Name undefined');

    const result = await scrap(name);
    const response = {
      statusCode: 200,
      body: JSON.stringify(result),
    };
    return response;
  } catch (error) {
    console.log(error);
    const response = {
      statusCode: 500,
      body: JSON.stringify(error),
    };
    return response;
  }
};

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-EN,en;q=0.9',
      'sec-ch-ua':
        '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
    },
  });
  return response;
}

export async function scrap(name) {
  const users = await scrapUsers(name);
  let articles = [];
  if (users && users.length) {
    const fistUser = users[0];
    const user = { id: fistUser.author_id, name: fistUser.name };
    articles = await scrapUserArticlesInfoFromId(user);
  }

  return { user: users[0], articles };
}

export async function scrapUsers(name, scraperApiUrl?) {
  const url =
    scraperApiUrl ||
    `${GOOGLE_SCHOLAR_URL}/citations?hl=en&view_op=search_authors&mauthors=${name}`;
  const response = await fetchPage(url);
  if (response.status === 403) {
    return scrapUsers(
      name,
      `http://api.scraperapi.com?api_key=${SCRAPPERAPI_API_KEY}&url=${url}`,
    );
  }
  const body = await readableToString2(response.body);
  const users = parseGoogleScholarFromText(body, name);

  if (!users && !scraperApiUrl) {
    return scrapUsers(
      name,
      `http://api.scraperapi.com?api_key=${SCRAPPERAPI_API_KEY}&url=${url}`,
    );
  }

  return users;
}

export async function scrapUserArticlesInfoFromId(user, scraperApiUrl?) {
  const url =
    scraperApiUrl || `${GOOGLE_SCHOLAR_URL}/citations?hl=en&user=${user.id}`;
  const response = await fetchPage(url);
  if (response.status === 403) {
    return scrapUserArticlesInfoFromId(
      user,
      `http://api.scraperapi.com?api_key=${SCRAPPERAPI_API_KEY}&url=${url}`,
    );
  }

  const body = await readableToString2(response.body);
  const articles = getArticlesParseGoogleScholarFromText(body, user.name);
  if (!articles && !scraperApiUrl) {
    return scrapUserArticlesInfoFromId(
      user,
      `http://api.scraperapi.com?api_key=${SCRAPPERAPI_API_KEY}&url=${url}`,
    );
  }

  return articles;
}

function parseGoogleScholarFromText(body, name) {
  const $ = cheerio.load(body);

  const users = $('.gsc_1usr');
  if (!users.length && $('.gs_med > p > strong').text() != name) return null;

  const results = [];
  for (const user of users) {
    const name = $(user).find('.gs_ai_name > a').text().trim();
    const email = prepareText($(user).find('.gs_ai_eml').text());

    const cited_by = parseInt(
      $(user).find('.gs_ai_cby').text().replace(/\D/g, ''),
      10,
    );
    const uri = $(user).find('.gs_ai_name > a').attr('href');
    const link = `${GOOGLE_SCHOLAR_URL}${uri}`;
    const author_id = parse(link)?.user;

    const interests = $(user)
      .find('.gs_ai_int > a')
      .map(function (i, el) {
        return {
          link: `${GOOGLE_SCHOLAR_URL}${$(this).attr('href')}`,
          title: prepareText($(this).text()),
        };
      })
      .toArray();

    const thumbnail = $(user).find('.gs_ai_pho img').attr('src');
    const affiliations = prepareText($(user).find('.gs_ai_aff').text());

    results.push({
      name,
      email,
      cited_by,
      link,
      author_id,
      interests,
      thumbnail,
      affiliations,
    });
  }

  return results;
}

function getArticlesParseGoogleScholarFromText(body, name) {
  const $ = cheerio.load(body);

  const articles = $('.gsc_a_tr');
  if (!articles.length && $('#gsc_prf_in').text() != name) return null;

  const results = [];
  for (const article of articles) {
    const uri = $(article).find('a.gsc_a_at').attr('href');
    const link = `${GOOGLE_SCHOLAR_URL}${uri}`;
    const year = prepareText($(article).find('.gsc_a_y > span').text());
    const title = prepareText($(article).find('.gsc_a_t > a').text());
    const authors = prepareText($(article).find('.gsc_a_t > div:first').text());

    const cited_by_link = $(article).find('.gsc_a_c > a').attr('href');
    const cited_by_value = parseInt($(article).find('.gsc_a_c > a').text(), 10);
    const cited_by_cites_id = parse(cited_by_link)?.cites;

    const citation_id = parse(uri)?.citation_for_view;
    const publication = prepareText(
      $(article).find('.gsc_a_t > div:last').text(),
    );

    results.push({
      link,
      year,
      title,
      authors,
      cited_by: {
        link: cited_by_link,
        value: cited_by_value,
        cites_id: cited_by_cites_id,
      },
      citation_id,
      publication,
    });
  }

  return results;
}

function prepareText(text) {
  return text
    .replaceAll(/\uFFFD/g, '')
    .replaceAll(/\n/g, '')
    .replace(/\s\s+/g, ' ')
    .trim();
}
