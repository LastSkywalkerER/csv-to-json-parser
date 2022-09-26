import * as fs from 'fs';
import * as path from 'path';

import { eol, options } from './constants';
import { splitChunkOnArray } from './helpers';

// const fileContent = fs.readFileSync(options.sourceFile, 'utf-8');
// const parsedContent = stringify(fileContent.split(eol).map((row) => row.split(options.separator).map((word) => word.trim())));
// fs.writeFileSync(options.resultFile, parsedContent);

const start = ({ sourceFile }: typeof options) => {
  const readStream = fs.createReadStream(sourceFile, { encoding: 'utf-8' });
  const writeStream = fs.createWriteStream(path.join(__dirname, '..', '..', 'assets', 'testLong.csv'), { encoding: 'utf-8' });

  const counter = 10000;

  let isFirstRead = true;
  let lastEnd = '';

  readStream.on('data', (chunk) => {
    const [begin, middle, end] = splitChunkOnArray(chunk as string);

    if (isFirstRead) {
      isFirstRead = false;

      writeStream.write(begin + middle.map((string) => eol + string));
      lastEnd = end;

      return;
    }

    for (let index = 0; index < counter; index++) {
      writeStream.write(lastEnd + begin + middle.map((string) => eol + string));
    }

    lastEnd = end;
  });

  readStream.on('end', () => {
    writeStream.write(eol + lastEnd);
  });
};

start(options);
