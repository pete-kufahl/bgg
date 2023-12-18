// utils
const axios = require('axios');
const { parseString } = require('xml2js');
const { parse, subDays, format } = require('date-fns');

const { preferredNames } = require('./labels')

const parseAndFormatDate = (dateString, daysAgo) => {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    const formattedDate = format(subDays(parsedDate, daysAgo), 'yyyy-MM-dd');
    return formattedDate;
};

async function fetchGamesPlayed(username, startdate, enddate) {
    // Define the URL template with placeholders for username, startdate, and enddate
    const apiUrlTemplate1 = 'https://boardgamegeek.com/xmlapi2/plays?username=%USERNAME%&mindate=%MINDATE%&maxdate=%MAXDATE%&type=thing&subtype=boardgame&brief=1';

    // Replace placeholders in the URL template with actual values
    //  bgg mindate = startdate, bgg maxdate = enddate
    var apiUrl1 = ''
    try {
        apiUrl1 = apiUrlTemplate1
          .replace('%USERNAME%', encodeURIComponent(username))
          .replace('%MINDATE%', encodeURIComponent(parseAndFormatDate(startdate, 7)))
          .replace('%MAXDATE%', encodeURIComponent(parseAndFormatDate(enddate, 0)));
      } catch (error) {
        console.error('Error during URL construction:', error);
    }
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

async function fetchGameDetails (username, plays_per_game, debug1 = false, debug2 = false) {
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
                        resolve(sortByPlays(parseGameDetails(result, debug2), plays_per_game));
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
        const parsed_id = parseInt(item.$.objectid, 10)

        // get game name
        game_name = item.name && item.name[0]._
        if (parsed_id in preferredNames) {
            game_name = preferredNames[parsed_id]
        }
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
            game_id: parsed_id,
            name: game_name,
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

// Function to remove leading "The" from names for sorting
function removeLeadingThe(name) {
    return name.replace(/^The\s+/i, '');
}

function sortByPlays(game_details, plays_per_game) {
    // Update play_count property for each game in game_details
    game_details.forEach(game => {
        game.play_count = plays_per_game[game.game_id] || 0;
    });

    game_details.sort((a, b) => {
        // First level of sort: by play_count in descending order
        const diff = b.play_count - a.play_count;
        if (diff !== 0) { return diff; }
        // Second level of sort: by name in ascending order
        return a.name.localeCompare(removeLeadingThe(b.name));
    });
    return game_details;
}

function mapRating(rating, spaces = 1) {
    const spacer = ' '.repeat(parseInt(spaces, 10));
    const k = rating.trim().match(/^\d+$/) ? parseInt(rating, 10) : -1;
  
    switch (k) {
        case 10:
            return `[BGCOLOR=#00CC00] [b]${rating}[/b] [/BGCOLOR]${spacer}`;
        case 9:
            return `[BGCOLOR=#33CC99] [b]${rating}[/b] [/BGCOLOR]${spacer}`;
        case 8:
            return `[BGCOLOR=#66FF99] [b]${rating}[/b] [/BGCOLOR]${spacer}`;
        case 7:
            return `[BGCOLOR=#99FFFF] [b]${rating}[/b] [/BGCOLOR]${spacer}`;
        case 6:
            return `[BGCOLOR=#9999FF] [b]${rating}[/b] [/BGCOLOR]${spacer}`;
        case 5:
            return `[BGCOLOR=#CC99FF] [b]${rating}[/b] [/BGCOLOR]${spacer}`;
        case 4:
            return `[BGCOLOR=#FF66CC] [b]${rating}[/b] [/BGCOLOR]${spacer}`;
        case 3:
            return `[BGCOLOR=#FF6699] [b]${rating}[/b] [/BGCOLOR]${spacer}`;
        case 2:
            return `[BGCOLOR=#FF3366] [b]${rating}[/b] [/BGCOLOR]${spacer}`;
        case 1:
            return `[BGCOLOR=#FF0000] [b]${rating}[/b] [/BGCOLOR]${spacer}`;
        default:
            return `[BGCOLOR=#A3A3A3] [b]--[/b] [/BGCOLOR]${spacer}`;
    }
}

function formatGameInfo(game, print_with_links = true, print_ranks = false) {
    const rating_str = mapRating(game['rating_value'], 1)
    const name = game['name']
    const game_id = game['game_id']
    name_str = print_with_links ? `[thing=${game_id}]${name}[/thing]` : name
    rank = String(game['rank'])
    plays = game['play_count']
    plays_str = plays > 1 ? ` x${plays}` : ''
    total = parseInt(game['numplays'], 10)
    if (plays == total) {
        total_str = '[b][COLOR=#FF0000][size=7]NEW![/size][/COLOR][/b]'
    } else {
        total_str = `[size=7](${total} so far)[/size]`
    }
    if (print_ranks) {
        if (rank.startsWith('Not')) {
            rank_str = '[size=8]' + 'unranked' + ' [/size]'
        } else {
            rank_str = '[size=8]' + rank.padStart(8, ' ') + ' [/size]'
        }
        formatted = `[c]${rank_str} [/c]${rating_str} ${name_str}${plays_str} ${total_str}`
    } else {
        formatted = `${rating_str} ${name_str}${plays_str} ${total_str}`
    }
    return formatted
}

  
module.exports = { fetchGamesPlayed, fetchGameDetails, formatGameInfo };
