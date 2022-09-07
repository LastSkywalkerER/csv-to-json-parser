# Csv to json parser

## Short Description

You need to build a command line tool which allows the user to convert CSV files to JSON.

## Estimation (h)

40

## Topics

- Core Concept
- Event Loop
- Globals
- Modules
- Streams
- Async Operations
- NPM
- Network

## Requirements

You need to build an npm package for parsing CSV files to JSON by implementing a custom NODE.js **transform** stream with the following abilities:

1. Set or automatically detect the separator that is used for parsing (use "auto-detect" by default if no separator provided)
2. Store result file near source file
3. Provide errors handling for converting process and incorrect command line arguments.

This application should accept following command line arguments using process.argv:

1. "sourceFile" - path to the csv file that need to be converted.

2. "resultFile" - path to the result json file.

3. "separator" - separator that is used while converting.

An example of running the app with command line arguments:

    - npm start csv2json.js --sourceFile "D:\source.csv" --resultFile "D:\result.json" --separator ","
    - npm start csv2json.js --sourceFile "D:\source.csv" --resultFile "D:\result.json" --separator " "
    - npm start csv2json.js --sourceFile "D:\source.csv" --resultFile "D:\result.json"

### Testing

Write a function that generates at least 10 gigabyte CSV file base on the filled in with [mock csv file](assets/test.csv)
Generate a CSV file and use it as an source file for your tool. When running the parser **pay attention to the RAM** that is taken by the process.

## Advanced Requirements

1. Implement JSON to CSV parser.
