import { eol } from './constants';

export const stringify = (data: any): string => {
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

export const splitChunkOnArray = (string: string): [string, string[], string] => {
  let begin = '';

  const middle = string.split(eol);

  let end = '';

  if (string.at(0) !== eol) {
    begin = middle.shift();
  }

  if (string.at(-1) !== eol) {
    end = middle.pop();
  }

  return [begin, middle, end];
};

export const createObjectJsonFromString = (string: string, separator: string, header: string[]): string => {
  return stringify(
    string.split(separator).reduce((acc, v, i) => {
      return { ...acc, [header.at(i)]: v.trim() };
    }, {}),
  );
};
