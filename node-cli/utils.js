// utils
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
     bgg game idm and values the total plays:
     {
        Game ID: 6688, Plays: 2
        Game ID: 18145, Plays: 1
        ...
     }
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

async function fetchGameDetails (username, plays_per_game, debug1 = false, debug2 = true) {
    // Look up the game rank and name for each ID
    const game_ids = Object.keys(plays_per_game).map(Number);
    const game_ids_str = game_ids.join(',');

    // Print the number of plays per game
    for (const game_id of game_ids) {
        const play_count = plays_per_game[game_id];
        debug1 && console.log(`Game ID: ${game_id}, Plays: ${play_count}`);
    }

    // URL for game details
    apiUrlTemplate2 = 'https://boardgamegeek.com/xmlapi2/collection?username=%USERNAME%&id=%GAMES%&stats=1'
    const apiUrl2 = apiUrlTemplate2
    .replace('%USERNAME%', encodeURIComponent(username))
    .replace('%GAMES%', game_ids_str);

    const maxRetries = 3;
    let retryCount = 0;

    debug2 && console.log(username)
    debug2 && console.log(apiUrl2)
    while (retryCount <= maxRetries) {
        if (retryCount > 0) {
            console.log(`Retrying (attempt ${retryCount})...`);
            await sleep(330);
        }

        try {
            const response = await axios.get(apiUrl2);
            const xml_str = response.data;

            return new Promise((resolve, reject) => {
                // Parse the XML string
                parseString(xml_str, (err, result) => {
                    if (err) {
                        reject(new Error(`Error parsing XML: ${err.message}`));
                    } else if (!result?.items) {
                        console.log('no items, message: ' + result?.message);
                    } else {
                        resolve(parseGameDetails(result, debug2));
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching data:', error.message);
            retryCount++;
        }
    }

    throw new Error('Max retries reached (details URL). Unable to get a successful response.');
}

function parseGameDetails(result, debug = false) {
    // debug && console.log(result)
    const items = result.items && result.items.item ? result.items.item : [];
    return items.map(item => {
        //debug && console.log(item)
        
        // fish out the ratings statistics
        const ratings = item.stats[0]?.rating;
        const user_rating = ratings[0].$.value
        const bgg_rating = ratings[0]?.average[0]?.$.value
        const bayes_rating = ratings[0]?.bayesaverage[0]?.$.value

        // fish out the bgg rank
        const list_ranks = ratings[0].ranks[0].rank
        const subtype_rank = list_ranks
            ? list_ranks.find(rank => rank.$.type === 'subtype')
            : null;
        const subtype_rank_value = subtype_rank ? subtype_rank.$.value : null;

        return {
            itemId: item.$.objectid,
            itemName: item.name && item.name[0]._,
            // year published
            rank: subtype_rank_value,
            numplays: item.numplays && item.numplays[0],
            average_rating: bgg_rating,
            bayes_average_rating: bayes_rating,
            rating_value: user_rating,
            comment: item.comment && item.comment[0]
        };
    });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { fetchGamesPlayed, fetchGameDetails };
