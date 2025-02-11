import { BadRequestException, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from 'src/prisma.service';
import { tryParseJSONObject } from 'src/utils/utils';
import { parse } from 'papaparse';

@Injectable()
export class F0AiService {
  public stages = {
    f1: 'the publication list with paper links and insights',
    f2: 'global researcher bibliography their publication lists (keywords: who)',
    f3: 'the evolution of this topic over time with publication amounts and typical project list',
    f4: 'the key research project distribution around the world',
    f5: 'the most relevant institutions looking through the issue',
    f7: 'the summary of social media showing this topic',
    f8: 'the patents applied by companies and academic institutions',
  };
  private openai: OpenAI;
  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_APIKEY,
    });
  }

  private async chatGPTResponse(content: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content }],
      temperature: 0,
      max_tokens: 1500,
    });
    return response.choices[0].message;
  }

  async search(search: string) {
    const response = await this.chatGPTResponse(
      `Please summarize theme in one-two concise sentence.
      Then, give perspective on this topic in one short sentences.
      Theme:${search}`,
    );

    return response;
  }

  async f3Evolution(search: string) {
    const response = await this.chatGPTResponse(
      `Please summarize theme in 1-3 concise sentence.
      Theme: How are "${search}" develop over time?`,
    );

    return response;
  }

  async getAdditionalInfoForSearch(search: string) {
    const imageTags = await this.prisma.area.findMany({});
    const tags = imageTags.map((e) => e.area).join();
    const response = await this.chatGPTResponse(
      `stages:(${JSON.stringify(this.stages)})
      tags:(${tags})
      Answer based on the user's theme: "${search}".
      1. Choose one tag only from suggested list of tags that is more relevant to this topic. If no tags matches the topic, return: 'not_found'.
      2. Just give me stages number (no more that 4) with a logic sequence as provided to answer the user's question thoroughly.
      3. We will use Semantic Publication database to look for the answer of this theme. What phrases (you can provide many) should I input in the search bar to look for the proper reference on this issue?
      Return all responses in JSON format, like this:
      {"stage": ["stage1","stage2"],"tag": "selected_tag", "keywords": ["phrase1","phrase2"]}`,
    );

    const infoJson = response.content;
    const info: { stage: string[]; tag: string; keywords: string[] } =
      tryParseJSONObject(infoJson);

    if (!info)
      throw new BadRequestException('Error parse response from openAI');

    return info;
  }

  async summarizeArticles(articles: [{ id; text: string }]) {
    const response = await this.chatGPTResponse(
      `Please provide 2-3 key insights or lessons learned from the following papers. Please return the results in array one valid cvs format, it's important, for each article this structure: id;insights. Save header. Use id from article. Here are the papers in JSON format [{ "id": "id", "text": "article" }]:${JSON.stringify(
        articles,
      )}`,
    );

    const summarizeCsv = response.content;

    const summarize: any = parse(summarizeCsv, {
      delimiter: ';',
      header: true,
      skipEmptyLines: true,
    })?.data;

    return summarize;
  }

  async getShortestNameAndCountryInstitution(institution: [{ id; name }]) {
    const response = await this.chatGPTResponse(
      `You have university list. Keep only university name.
      Need to remove unnecessary words like location name, Ph. D, Federal etc. And give country name.
      For example "Federal University of Agriculture, Abeokuta, Nigeria" turn to "University of Agriculture;Nigeria".
      Return in json [{id,shortName:"name",country:"id ISO 3166 ALPHA-2"}]
      University list in JSON:${JSON.stringify(institution)}`,
    );

    const infoJson = response.content;
    const info: [{ id: string; shortName: string; country: string }] =
      tryParseJSONObject(infoJson);

    if (!info)
      throw new BadRequestException('Error parse response from openAI');

    return info;
  }
}
