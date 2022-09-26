import * as os from 'os';
import * as path from 'path';

export const eol = os.EOL || '\r\n';

const defaultOptions = {
  sourceFile: path.join(__dirname, '..', '..', 'assets', 'test.csv'),
  resultFile: path.join(__dirname, '..', '..', 'assets', 'test.json'),
  separator: '',
};

export const options = process.argv.reduce((acc, v, i, arr) => {
  const key = v.replace('--', '');

  if (Object.keys(defaultOptions).includes(key) && !Object.keys(defaultOptions).includes(arr.at(i + 1))) {
    return { ...acc, [key]: arr.at(i + 1) };
  }

  return acc;
}, defaultOptions);
