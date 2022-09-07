import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const pathFrom = path.join(__dirname, '..', 'assets', 'test.csv');
const pathTo = path.join(__dirname, '..', 'assets', 'test.json');
const csvDivider = ',';
const jsonDivider = ',';
const eol = '\r';

const fileContent = fs.readFileSync(pathFrom, 'utf-8');

const stringify = (data: any): string => {
  if (data === undefined) return undefined;
  if (data === null) return 'null';
  if (data.toString() === 'NaN') return 'null';
  if (data === Infinity) return 'null';
  if (data.constructor === String) return '"' + data.replace(/"/g, '\\"') + '"';
  if (data.constructor === Number) return String(data);
  if (data.constructor === Boolean) return data ? 'true' : 'false';
  if (data.constructor === Array)
    return (
      '[' +
      data
        .reduce((acc, v) => {
          if (v === undefined || v === NaN || v === Infinity) return [...acc, 'null'];
          else return [...acc, stringify(v)];
        }, [])
        .join(',') +
      ']'
    );
  if (data.constructor === Object)
    return (
      '{' +
      Object.keys(data)
        .reduce((acc, k) => {
          if (data[k] === undefined) return acc;
          else return [...acc, stringify(k) + ':' + stringify(data[k])];
        }, [])
        .join(',') +
      '}'
    );

  return '{}';
};

const parsedContent = stringify(fileContent.split(eol).map((row) => row.split(csvDivider).map((word) => word.trim())));

fs.writeFileSync(pathTo, parsedContent);
