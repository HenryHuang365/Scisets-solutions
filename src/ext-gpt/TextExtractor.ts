import { parseOfficeAsync } from 'officeparser';
import { extractText } from 'unpdf';
import chardet from 'chardet';
import { BadRequestException } from '@nestjs/common';

function plainTextExtractor(fileBuffer: Buffer) {
  const encoding = chardet.detect(fileBuffer);
  const strategies = {
    'UTF-8': 'utf8',
    'UTF-16LE': 'utf16le',
  };
  const selectedEncoding = strategies[encoding];
  if (!selectedEncoding) {
    throw new BadRequestException('Unsupported encoding');
  }
  return fileBuffer.toString(selectedEncoding);
}

async function pdfExtractor(fileBuffer: Buffer) {
  const pdfInfo = await extractText(new Uint8Array(fileBuffer), {
    mergePages: true,
  });
  return Array.isArray(pdfInfo.text) ? pdfInfo.text.join() : pdfInfo.text;
}

async function officeDocumentExtractor(fileBuffer: Buffer) {
  return await parseOfficeAsync(fileBuffer);
}

function createTextExtractor() {
  const strategies = {};

  function setStrategy(mimetype, strategy) {
    strategies[mimetype] = strategy;
  }

  async function extract(file) {
    const strategy = strategies[file.mimetype];
    if (!strategy) {
      throw new Error('Unsupported file type');
    }
    return await strategy(file.buffer);
  }

  return { setStrategy, extract };
}

export {
  plainTextExtractor,
  pdfExtractor,
  officeDocumentExtractor,
  createTextExtractor,
};
