import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { F0AiService } from './f0-ai/f0-ai.service';
import { F1PublicationsService } from './f1-publications/f1-publications.service';
import { F2AuthorsService } from './f2-authors/f2-authors.service';
import { F3EvolutionService } from './f3-evolution/f3-evolution.service';
import { F4KeyResearchService } from './f4-key-research/f4-key-research.service';
import { F7SocialMediaService } from './f7-social-media/f7-social-media.service';
import { F8PatentService } from './f8-patent/f8-patent.service';
import { VoteDto } from './app.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly f0AiService: F0AiService,
    private readonly f1PublicationsService: F1PublicationsService,
    private readonly f2AuthorsService: F2AuthorsService,
    private readonly f3EvolutionService: F3EvolutionService,
    private readonly f4KeyResearchService: F4KeyResearchService,
    private readonly f7SocialMediaService: F7SocialMediaService,
    private readonly f8PatentService: F8PatentService,
    private prisma: PrismaService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async search(search: string, stageForTest: string, page = 1) {
    const start = performance.now();

    const analyticQuery = await this.prisma.analyticQuery.findFirst({
      where: {
        query: search,
      },
      orderBy: { createdAt: 'desc' },
    });

    let analyticQueryNew;
    if (page === 1) {
      analyticQueryNew = await this.prisma.analyticQuery.create({
        data: {
          query: search,
          area: 'not_found',
        },
      });
    }

    let { keywords, area } = analyticQuery || {};
    const { stage, createdAt } = analyticQuery || {};

    let searchStage = stage?.split(',');

    const previousDate = new Date(new Date().setHours(-1));
    if (!stage || createdAt < previousDate || !createdAt) {
      const additionalInfo =
        await this.f0AiService.getAdditionalInfoForSearch(search);
      area = additionalInfo.tag;
      searchStage = additionalInfo.stage;
      keywords = additionalInfo.keywords.join();
    }
    if (page === 1) {
      analyticQueryNew = await this.prisma.analyticQuery.update({
        where: { id: analyticQueryNew.id },
        data: {
          query: search,
          keywords,
          area,
          stage: searchStage.join(),
        },
      });
    }

    if (area === 'not_found') {
      return new NotFoundException(
        'This question is not related to the fields in which Scisets AI can provide assistance. Please try asking R&D-related questions instead.',
      );
    }

    searchStage = stageForTest
      ? stageForTest.split(',')
      : ['f0'].concat(searchStage); //FIXME: for develop

    const resultData = searchStage.reduce(
      (a, v) => ({ ...a, [v.trim()]: {} }),
      {},
    );

    let articles = [];
    let authors = [];

    if (
      searchStage.includes('f0') ||
      searchStage.includes('f1') ||
      searchStage.includes('f2')
    ) {
      const f0Promise = searchStage.includes('f0')
        ? Promise.all([
            this.f0AiService.search(search),
            this.prisma.imageAI.findFirst({ where: { area: { area } } }),
          ])
        : Promise.resolve([]);

      if (searchStage.includes('f1') || searchStage.includes('f2')) {
        articles = await this.f1PublicationsService.search(keywords, page);
      }

      const f1Promise = searchStage.includes('f1')
        ? this.setKeyInsightsForArticle(articles)
        : Promise.resolve([]);

      const [f0Data, f1Works] = await Promise.all([f0Promise, f1Promise]);

      if (searchStage.includes('f0')) {
        resultData['f0'] = f0Data[0];
        resultData['f0']['imageUrl'] = f0Data[1]?.url;
      }

      if (searchStage.includes('f1')) {
        resultData['f1'] = f1Works;
      }

      if (searchStage.includes('f2')) {
        authors = await this.f2AuthorsService.getAuthorsFromArticles(
          articles['results'],
        );
        resultData['f2'] = authors.length ? authors : undefined;
      }
    }
    if (searchStage.includes('f3')) {
      const f3 = await this.f3EvolutionService.search(keywords, area);
      if (f3.data.length) {
        resultData['f3'] = f3;
        const f3Ai = await this.f0AiService.f3Evolution(area);
        resultData['f3']['ai'] = f3Ai;
      } else resultData['f3'] = undefined;
    }
    if (searchStage.includes('f4')) {
      const f4 = await this.f4KeyResearchService.search(area);
      resultData['f4'] = f4.length ? f4 : undefined;
    }
    if (searchStage.includes('f5')) {
      if (!authors.length)
        authors = await this.f2AuthorsService.search(keywords, page);

      const institutions = authors
        .filter((e) => e.affiliations)
        .map((e) => e.affiliations);
      const institutionsRaw = await this.prisma.institution.findMany({
        where: { name: { in: [...new Set(institutions)] } },
        select: { id: true, name: true, shortName: true },
      });
      const notShortInstitution = institutionsRaw.filter((e) => !e.shortName);
      if (notShortInstitution.length)
        await this.setShotesNameAndCountryInstitution(notShortInstitution);
      const institutionsDB = await this.prisma.institution.findMany({
        where: { name: { in: [...new Set(institutions)] } },
        include: { Authors: true, countryLink: true, _count: true },
      });
      resultData['f5'] = institutionsDB.length ? institutionsDB : undefined;
    }
    if (searchStage.includes('f7')) {
      const f7 = await this.f7SocialMediaService.search(area);
      resultData['f7'] = f7.length ? f7 : undefined;
    }
    if (searchStage.includes('f8')) {
      resultData['f8'] = await this.f8PatentService.search(keywords);
    }

    const result = {
      data: resultData,
      id: analyticQuery?.id || analyticQueryNew?.id,
    };

    const stop = performance.now();

    if (page === 1) {
      setImmediate(async () => {
        const duration = stop - start;
        await this.prisma.analyticQuery.update({
          where: { id: analyticQueryNew.id },
          data: { duration },
        });
      });
    }

    return result;
  }

  async setKeyInsightsForArticle(articles) {
    if (!articles?.results?.length) return articles;

    const articlesForAI = articles['results'].map((e) => ({
      id: e.id,
      text: e.abstract?.substring(0, 512) || e.fullText?.substring(0, 512),
    }));

    const keyInsights = await this.f0AiService.summarizeArticles(articlesForAI);

    const result = articles['results'].map((e) => ({
      ...e,
      keyInsights: keyInsights
        .filter((k) => k.id == e.id)
        .map((e) => e.insights),
    }));

    return result;
  }

  async vote(body: VoteDto) {
    try {
      const result = {
        page: body.page,
        status: body.isLike,
        createAt: new Date(),
      };

      await this.prisma.analyticQuery.update({
        where: { id: body.id },
        data: { vote: { push: result } },
      });

      return { status: 'ok' };
    } catch (e) {
      return e;
    }
  }

  async setShotesNameAndCountryInstitution(institutions) {
    try {
      const institutionAi =
        await this.f0AiService.getShortestNameAndCountryInstitution(
          institutions,
        );
      for (const institution of institutionAi) {
        await this.prisma.institution.update({
          where: { id: institution.id },
          data: {
            shortName: institution.shortName,
            countryLink: institution.country
              ? { connect: { alpha2: institution.country.toLowerCase() } }
              : {},
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
