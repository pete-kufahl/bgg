
const axios = require('axios');
const { parseString } = require('xml2js');
const { formatISO, parse, subDays } = require('date-fns');

function parseAndFormatDate(inputDate, defaultValue) {
    if (!inputDate) {
        return formatISO(subDays(new Date(), defaultValue), { representation: 'date' });
    }

    const parsedDate = parse(inputDate, { strict: false });

    if (isValid(parsedDate)) {
        return formatISO(parsedDate, { representation: 'date' });
    } else {
        console.error(`Error: Invalid date format for "${inputDate}". Please use a valid date format.`);
        process.exit(1);
    }
}

async function fetchDataWithRetry(username, startdate, enddate) {
    // Define the URL template with placeholders for username, startdate, and enddate
    // f'https://boardgamegeek.com/xmlapi2/plays?username={username}&mindate={mindate}&maxdate={maxdate}&type=thing&subtype=boardgame&brief=1'
    const apiUrlTemplate1 = 'https://boardgamegeek.com/xmlapi2/plays?username=%USERNAME%&mindate=%MINDATE%&maxdate=%MAXDATE%&type=thing&subtype=boardgame&brief=1';

    // Replace placeholders in the URL template with actual values
    //  bgg mindate = startdate, bgg maxdate = enddate
    const apiUrl1 = apiUrlTemplate1
    .replace('%USERNAME%', encodeURIComponent(username))
    .replace('%MINDATE%', startdate ? encodeURIComponent(startdate) : '')
    .replace('%MAXDATE%', enddate ? encodeURIComponent(enddate) : '');

    let retryCount = 0;
    const maxRetries = 3;

    do {
        if (retryCount > 0) {
        console.log(`Retrying (attempt ${retryCount})...`);
        await sleep(330);
        }

    try {
        const response = await axios.get(apiUrl1);

        if (response.status === 200) {
            const xmlData = response.data;
            // Parse XML to JavaScript object
            parseString(xmlData, (err, result) => {
                if (err) {
                    console.error('Error parsing XML:', err.message);
                } else {
                    console.log('Parsed XML:', JSON.stringify(result, null, 2));
                }
        });

        return;
        } else if (response.status === 202) {
            console.log(`Received 202 status code. Retrying...`);
        } else {
            console.error(`Unexpected status code: ${response.status}`);
            return;
        }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      return;
    }

    retryCount++;
  } while (retryCount <= maxRetries);

  console.error(`Max retries reached. Unable to get a 200 status code.`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { fetchDataWithRetry };
