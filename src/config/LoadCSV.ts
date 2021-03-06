import csvParse from 'csv-parse';
import fs from 'fs';


async function loadCSV(filePath: string): Promise<Array<string>> {

  const readCSVStream = fs.createReadStream(filePath);

	const parseStream = csvParse({
	  from_line: 2,
	  ltrim: true,
	  rtrim: true,
	});

	const parseCSV = readCSVStream.pipe(parseStream);

	const lines = new Array();

  parseCSV.on('data', line => {
		lines.push(line);
	});

	await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

	return lines;
 }

export default loadCSV;


