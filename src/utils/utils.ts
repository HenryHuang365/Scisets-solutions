import { encoding_for_model } from '@dqbd/tiktoken';

const encoder = encoding_for_model('gpt-3.5-turbo');

function numTokensFromString(message) {
  const tokens = encoder.encode(message);
  return tokens.length;
}

export function removeLargeText(inputString, maxTokens = 16000) {
  const tokensCount = numTokensFromString(inputString);

  if (tokensCount <= maxTokens) {
    return inputString;
  }

  const words = inputString.split(' ');

  let truncatedString = '';
  let currentTokensCount = 0;

  for (const word of words) {
    const wordTokens = numTokensFromString(word);

    if (currentTokensCount + wordTokens <= maxTokens) {
      truncatedString += word + ' ';
      currentTokensCount += wordTokens;
    } else {
      break;
    }
  }

  return truncatedString.trim();
}
export async function readableToString2(readable) {
  let result = '';
  for await (const chunk of readable) {
    result += Buffer.from(chunk).toString();
  }
  return result;
}

export function tryParseJSONObject(jsonString) {
  try {
    const result = JSON.parse(jsonString);
    if (result && typeof result === 'object') return result;
  } catch (e) {}

  return false;
}

export async function fetchChatGPT(data) {
  try {
    const openAiUrl = 'https://api.openai.com/v1/chat/completions';
    const openAiHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_APIKEY}`,
    };

    const response = await fetch(openAiUrl, {
      method: 'POST',
      headers: openAiHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(responseBody);
    }

    const responseBody = await response.json();
    return responseBody.choices[0].message;
  } catch (error) {
    console.error('Error:', error.message);
  }
}
