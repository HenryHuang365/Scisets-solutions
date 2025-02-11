import { Injectable } from '@nestjs/common';
import { getJson } from 'serpapi';

@Injectable()
export class F8PatentService {
  async search(search: string) {
    return this.getPatientPercent(search);
  }

  async getPatientPercent(search: string) {
    const response = await getJson({
      engine: 'google_patents',
      q: search,
      api_key: process.env.SERPAPI_APIKEY,
    });
    const profiles = response['summary']['assignee'];
    return profiles;
  }
}
