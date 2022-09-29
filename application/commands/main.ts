import * as child_process from 'child_process';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as stream from 'stream';

import { eol, options } from './constants';

class ProcessEmitter extends EventEmitter {}
interface CommandsProps extends Record<string, unknown> {
  processEmitter: ProcessEmitter;
  separator: string;
}

class Commands extends stream.Transform {
  separator: string;
  jobCounter: number;
  processEmitter: ProcessEmitter;

  constructor({ processEmitter, separator, ...restOptions }: CommandsProps) {
    super({ ...restOptions, decodeStrings: false });

    this.separator = separator;
    this.jobCounter = 0;
    this.processEmitter = processEmitter;

    this.processEmitter.on('execute', this.processCallback);
    this.processEmitter.on('closeProcess', this.checkClose);
  }

  checkClose = (commands: string[], callback: stream.TransformCallback) => {
    if (this.jobCounter === commands.length) {
      this.jobCounter = 0;
      callback();
    }
  };

  processCallback = (element: string, index: number, error: child_process.ExecException, stdout: string, stderr: string) => {
    this.jobCounter++;

    if (error || stderr) {
      console.error(error || stderr);
      this.push(`job ${++index} - ${element} error ${error || stderr}`);

      return;
    }

    console.log(stdout);
    this.push(`job ${++index} - ${element} output: ${stdout ? stdout : 'success'}`);
  };

  _transform(chunk: string, encoding: BufferEncoding, callback: stream.TransformCallback): void {
    if (encoding !== 'utf8') {
      this.emit('error', new Error('Only UTF-8'));

      return callback();
    }

    const commands = chunk.split(eol);

    commands.forEach((element, index) => {
      const process = child_process.exec(element, (error: child_process.ExecException, stdout: string, stderr: string) =>
        this.processEmitter.emit('execute', element, index, error, stdout, stderr),
      );

      process.on('close', () => {
        this.processEmitter.emit('closeProcess', commands, callback);
      });
    });
  }
}

const start = ({ resultFile, separator, sourceFile }: typeof options) => {
  const readStream = fs.createReadStream(sourceFile, { encoding: 'utf-8' });
  const writeStream = fs.createWriteStream(resultFile, { encoding: 'utf-8' });

  readStream.pipe(new Commands({ separator, processEmitter: new ProcessEmitter() })).pipe(writeStream);
};

start(options);
