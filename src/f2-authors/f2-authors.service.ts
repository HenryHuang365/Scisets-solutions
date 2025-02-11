import { BadRequestException, Injectable } from '@nestjs/common';
import { getJson } from 'serpapi';
import { PrismaService } from 'src/prisma.service';
import { readableToString2 } from 'src/utils/utils';
import { scrap } from './scrapEngine';

@Injectable()
export class F2AuthorsService {
  constructor(private prisma: PrismaService) {}

  async search(search: string, page = 1) {
    const works = await this.searchAuthors(search, page);
    return this.getAuthorsFromArticles(works.results);
  }

  async getAuthorsFromArticles(works) {
    const profiles = [];
    try {
      const authorsPopular = [];
      const frequency = {};
      const testALlAuthors = [];
      for (const work of works) {
        for (const authorFind of work.authors) {
          const author = authorFind.name;
          testALlAuthors.push(author);
          if (frequency[author]) {
            frequency[author]++;
          } else {
            frequency[author] = 1;
          }
        }
      }
      const uniques = Object.keys(frequency);

      // authorsPopular = uniques.sort((a, b) => frequency[b] - frequency[a]);

      for (const author of uniques) {
        if (profiles.length >= 6) break;

        const authorDB = await this.prisma.authors.findMany({
          where: { OR: [{ name: author }, { coreCoUkName: author }] },
        });

        let profile = authorDB.filter((e) => e['info']['author_id']).at(0);

        if (!profile?.articles && profile?.info['author_id']) {
          const profileId = profile?.info['author_id'];
          const userId = profile.id;
          const authorFromGoogleScholar =
            await this.getAuthorFullInfoFromId(profileId);
          profile = await this.prisma.authors.update({
            where: { id: userId },
            data: { articles: authorFromGoogleScholar['articles'] },
          });
        }

        if (!authorDB.length) {
          const { user: oneProfile, articles } =
            await this.getProfileScrapper(author);
          if (!oneProfile) {
            await this.prisma.authors.create({
              data: { name: '', coreCoUkName: author, info: {} },
            });
            continue;
          }
          profile = await this.prisma.authors.create({
            data: {
              name: oneProfile.name,
              coreCoUkName: author,
              info: oneProfile,
              articles: articles,
              institutionLink: {
                connectOrCreate: {
                  where: { name: oneProfile.affiliations },
                  create: { name: oneProfile.affiliations },
                },
              },
            },
          });
        }
        if (!profile) continue;
        profiles.push({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          ...profile?.info,
          articles: profile.articles,
          coreCoUkName: profile.coreCoUkName,
        });
      }

      return profiles.flatMap((e) => (e === null ? [] : e));
    } catch (error) {
      console.log(error);
      return profiles.flatMap((e) => (e === null ? [] : e));
    }
  }

  async getProfileSerpApi(author) {
    const profilesFromGoogle = await this.getAuthorShortInfoFromName(author);
    if (!profilesFromGoogle) return { user: null, articles: null };

    const oneProfile = profilesFromGoogle[0];
    const profileId = oneProfile['author_id'];
    const authorFromGoogleScholar =
      await this.getAuthorFullInfoFromId(profileId);
    return { user: oneProfile, articles: authorFromGoogleScholar['articles'] };
  }

  async getProfileScrapper(author) {
    const response = await this.getAuthorAndArticlesFromNameScrapper(author);
    if (!response?.user) return { user: null, articles: null };

    return { user: response.user, articles: response.articles };
  }

  async searchAuthors(search: string, page: number) {
    const limit = 10;
    const offset = page * limit - limit;
    const searchBody = JSON.stringify({
      q: search,
      limit,
      offset,
      exclude: ['fullText', 'abstract', 'references', 'links'],
    });
    const response = await fetch(
      `https://api.core.ac.uk/v3/search/works`, // TODO: Put url in config
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Bearer ${process.env.CORE_AC_UK_APIKEY}`,
        },
        body: searchBody,
      },
    );

    if (!response.ok) new BadRequestException({ error: response.statusText });

    const result = await readableToString2(response.body);
    const json = JSON.parse(result);
    return json;
  }

  async getAuthorShortInfoFromName(author: string) {
    const response = await getJson({
      engine: 'google_scholar_profiles',
      mauthors: author,
      api_key: process.env.SERPAPI_APIKEY,
    });
    const profiles = response['profiles'];
    return profiles;
  }

  // async getAuthorAndArticlesFromNameScrapper(author: string) {
  //   const response = await fetch(
  //     `${process.env.SCRAPPER_URL}?name=${encodeURIComponent(author)}`,
  //     { method: 'GET' },
  //   );
  //   if (!response.ok) return;
  //   const profiles = await response.json();
  //   return profiles;
  // }
  async getAuthorAndArticlesFromNameScrapper(author: string) {
    const response = await scrap(author);
    return response;
  }

  async getAuthorFullInfoFromId(authorId: string) {
    const response = await getJson({
      engine: 'google_scholar_author',
      author_id: authorId,
      api_key: process.env.SERPAPI_APIKEY,
    });
    const profiles = response;
    return profiles;
  }
}
