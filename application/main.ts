import * as fs from 'fs';

import { options } from './constants';
import { createObjectJsonFromString, splitChunkOnArray } from './helpers';

// const fileContent = fs.readFileSync(options.sourceFile, 'utf-8');
// const parsedContent = stringify(fileContent.split(eol).map((row) => row.split(options.separator).map((word) => word.trim())));
// fs.writeFileSync(options.resultFile, parsedContent);

const start = ({ resultFile, separator, sourceFile }: typeof options) => {
  const readStream = fs.createReadStream(sourceFile, { encoding: 'utf-8' });
  const writeStream = fs.createWriteStream(resultFile, { encoding: 'utf-8' });

  let isFirstRead = true;
  let header: string[] = [];
  let lastEnd = '';

  writeStream.write('[');

  readStream.on('data', (chunk) => {
    const [begin, middle, end] = splitChunkOnArray(chunk as string);

    if (isFirstRead) {
      isFirstRead = false;

      if (!separator) {
        const separatorPosition = begin.match(/[0-9A-Fa-f]\b/).index + 1;

        separator = begin[separatorPosition];
      }

      header = begin.split(separator);

      writeStream.write(middle.map((string) => createObjectJsonFromString(string, separator, header)) + ',');
      lastEnd = end;

      return;
    }

    writeStream.write(
      createObjectJsonFromString(lastEnd + begin, separator, header) +
        ',' +
        middle.map((string) => createObjectJsonFromString(string, separator, header)) +
        ',',
    );

    lastEnd = end;
  });

  readStream.on('end', () => {
    writeStream.write(createObjectJsonFromString(lastEnd, separator, header) + ']');
  });
};

start(options);
