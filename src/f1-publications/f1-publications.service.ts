import { BadRequestException, Injectable } from '@nestjs/common';
import { readableToString2 } from 'src/utils/utils';

@Injectable()
export class F1PublicationsService {
  async search(search: string, page = 1) {
    const limit = 5;
    const fakeLimit = 20;
    const offset = (page || 1) * limit - limit;
    const searchBody = JSON.stringify({
      q: search,
      limit: fakeLimit,
      offset,
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

    if (!response.ok)
      return new BadRequestException({ error: response.statusText });

    const result = await readableToString2(response.body);
    const json = JSON.parse(result);
    if (json.message) {
      return [];
    }
    json.results = json.results.slice(0, 5);
    return json;
  }
}
