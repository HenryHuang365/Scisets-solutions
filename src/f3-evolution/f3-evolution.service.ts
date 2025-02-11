import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { readableToString2 } from 'src/utils/utils';

@Injectable()
export class F3EvolutionService {
  constructor(private prisma: PrismaService) {}

  async search(search: string, area: string) {
    const charts = await this.searchCharts(search);
    const data = await this.searchData(area);

    return { charts, data };
  }

  async searchCharts(search: string) {
    const searchJSON = JSON.stringify({
      q: search,
      aggregations: ['yearPublished'],
    });
    const response = await fetch(
      `https://api.core.ac.uk/v3/search/works/aggregate`, // TODO: Put url in config
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Bearer ${process.env.CORE_AC_UK_APIKEY}`,
        },
        body: searchJSON,
      },
    );
    if (!response.ok) return;

    const result = await readableToString2(response.body);
    return result;
  }

  async searchData(area: string) {
    return this.prisma.f3Data.findMany({ where: { area } });
  }
}
