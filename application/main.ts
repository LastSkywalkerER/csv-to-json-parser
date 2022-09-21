import * as fs from 'fs';
import * as stream from 'stream';

import { options } from './constants';
import { createObjectJsonFromString, splitChunkOnArray } from './helpers';

// const fileContent = fs.readFileSync(options.sourceFile, 'utf-8');
// const parsedContent = stringify(fileContent.split(eol).map((row) => row.split(options.separator).map((word) => word.trim())));
// fs.writeFileSync(options.resultFile, parsedContent);

interface CsvToJsonProps extends Record<string, unknown> {
  separator: string;
}

class CsvToJson extends stream.Transform {
  separator: string;

  isFirstRead: boolean;
  header: string[];
  lastEnd: string;

  constructor({ separator, ...restOptions }: CsvToJsonProps = { separator: '\r\n' }) {
    super({ ...restOptions, decodeStrings: false });

    this.separator = separator;

    this.isFirstRead = true;
    this.header = [];
    this.lastEnd = '';
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: stream.TransformCallback): void {
    if (encoding !== 'utf8') {
      this.emit('error', new Error('Only UTF-8'));

      return callback();
    }

    const [begin, middle, end] = splitChunkOnArray(chunk as string);

    if (this.isFirstRead) {
      this.isFirstRead = false;

      if (!this.separator) {
        const separatorPosition = begin.match(/[0-9A-Fa-f]\b/).index + 1;

        this.separator = begin[separatorPosition];
      }

      this.header = begin.split(this.separator);

      this.push(middle.map((string) => createObjectJsonFromString(string, this.separator, this.header)) + ',');
      this.lastEnd = end;

      callback();
    } else {
      this.push(
        createObjectJsonFromString(this.lastEnd + begin, this.separator, this.header) +
          ',' +
          middle.map((string) => createObjectJsonFromString(string, this.separator, this.header)) +
          ',',
      );

      this.lastEnd = end;

      callback();
    }
  }

  _flush(callback: stream.TransformCallback): void {
    this.push(createObjectJsonFromString(this.lastEnd, this.separator, this.header) + ']');

    callback();
  }
}

const start = ({ resultFile, separator, sourceFile }: typeof options) => {
  const readStream = fs.createReadStream(sourceFile, { encoding: 'utf-8' });
  const writeStream = fs.createWriteStream(resultFile, { encoding: 'utf-8' });

  writeStream.write('[');

  readStream.pipe(new CsvToJson({ separator })).pipe(writeStream);
};

start(options);
