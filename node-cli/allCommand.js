
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

async function fetchGamesPlayed(username, startdate, enddate) {
    // Define the URL template with placeholders for username, startdate, and enddate
    // f'https://boardgamegeek.com/xmlapi2/plays?username={username}&mindate={mindate}&maxdate={maxdate}&type=thing&subtype=boardgame&brief=1'
    const apiUrlTemplate1 = 'https://boardgamegeek.com/xmlapi2/plays?username=%USERNAME%&mindate=%MINDATE%&maxdate=%MAXDATE%&type=thing&subtype=boardgame&brief=1';

    // Replace placeholders in the URL template with actual values
    //  bgg mindate = startdate, bgg maxdate = enddate
    const apiUrl1 = apiUrlTemplate1
    .replace('%USERNAME%', encodeURIComponent(username))
    .replace('%MINDATE%', encodeURIComponent(parseAndFormatDate(startdate, 7)))
    .replace('%MAXDATE%', encodeURIComponent(parseAndFormatDate(enddate, 0)));

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
        if (retryCount > 0) {
            console.log(`Retrying (attempt ${retryCount})...`);
            await sleep(330);
        }

        try {
            const response = await axios.get(apiUrl1);
            const xml_str = response.data;

            return new Promise((resolve, reject) => {
                // Parse the XML string
                parseString(xml_str, (err, result) => {
                if (err) {
                    reject(new Error(`Error parsing XML: ${err.message}`));
                } else {
                    resolve(parseAllGamesPlayed(result));
                }
                });
            });
        } catch (error) {
        console.error('Error fetching data:', error.message);
        retryCount++;
        }
    }

    throw new Error('Max retries reached (first URL). Unable to get a successful response.');
}

/*
    given the parsed XML result of the initial API call, returns an object with keys being the
     bgg game idm and values the total plays
    {

    }
    returns an
*/
function parseAllGamesPlayed(result, debug = false) {
    // Extract game IDs and number of plays
    const gameplays = result.plays && result.plays.play ? result.plays.play : [];
    const plays_per_game = {};

    gameplays.forEach(gameplay => {
        const game = gameplay.item && gameplay.item[0];
        if (game) {
            const game_id = parseInt(game.$.objectid, 10);
            const play_count = parseInt(gameplay.$.quantity || 1, 10);
            plays_per_game[game_id] = (plays_per_game[game_id] || 0) + play_count;
        }
    });

    return plays_per_game;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { fetchGamesPlayed };
