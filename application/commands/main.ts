import * as child_process from 'child_process';
import * as fs from 'fs';
import * as stream from 'stream';

import { eol, options } from './constants';

interface CommandsProps extends Record<string, unknown> {
  separator: string;
}

class Commands extends stream.Transform {
  separator: string;
  jobCounter: number;

  constructor({ separator, ...restOptions }: CommandsProps = { separator: '\r\n' }) {
    super({ ...restOptions, decodeStrings: false });

    this.separator = separator;
    this.jobCounter = 0;
  }

  _transform(chunk: string, encoding: BufferEncoding, callback: stream.TransformCallback): void {
    if (encoding !== 'utf8') {
      this.emit('error', new Error('Only UTF-8'));

      return callback();
    }

    const commands = chunk.split(eol);

    const checkExit = () => {
      if (this.jobCounter === commands.length) {
        this.jobCounter = 0;
        callback();
      }
    };

    const processCallback =
      (element: string, index: number) => (error: child_process.ExecException, stdout: string, stderr: string) => {
        this.jobCounter++;

        if (error || stderr) {
          console.error(error || stderr);
          this.push(`job ${++index} - ${element} error ${error || stderr}`);

          return;
        }

        console.log(stdout);
        this.push(`job ${++index} - ${element} output: ${stdout ? stdout : 'success'}`);
      };

    commands.forEach((element, index) => {
      const process = child_process.exec(element, processCallback(element, index));

      // process.stdout.on('data', (data) => {
      //   console.log(data.toString('utf8'));
      //   this.push(`job ${++index} - ${element} output: ${data ? data.toString('utf8') : 'success'}`);
      // });

      // process.stderr.on('error', (error) => {
      //   console.error(error);
      //   this.push(`job ${++index} - ${element} error ${error}`);
      // });

      process.on('close', () => {
        checkExit();
      });
    });
  }
}

const start = ({ resultFile, separator, sourceFile }: typeof options) => {
  const readStream = fs.createReadStream(sourceFile, { encoding: 'utf-8' });
  const writeStream = fs.createWriteStream(resultFile, { encoding: 'utf-8' });

  readStream.pipe(new Commands({ separator })).pipe(writeStream);
};

start(options);
