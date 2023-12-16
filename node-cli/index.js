const { program } = require('commander');
const { fetchGamesPlayed, fetchGameDetails, formatGameInfo } = require('./utils');

program
    .version('1.0.0')
    .description('A CLI tool for calling a remote URL with a username and reading the XML response')

program
    .command('all')
    .description('Fetch data for all records')
    .option('-u, --username <username>', 'The username to include in the URL')
    .option('-s, --startdate <date>', 'Start date (yyyy-MM-dd) for data fetching. Default: Seven days ago.')
    .option('-e, --enddate <date>', 'End date (yyyy-MM-dd) for data fetching. Default: Now.')
    .option('-l, --links', 'output game names as BGG links')
    .option('-r, --ranks', 'include BGG ranks in output')
    .option('-d, --debug', 'output extra debugging')
    .action(async (options) => {
        try {
            const { username, startdate, enddate, links, ranks, debug } = options;
            console.log(options)
            const plays_per_game = await fetchGamesPlayed(username, startdate, enddate);
            console.log('ok!')
            const details = await fetchGameDetails(username, plays_per_game);
            // for (const game_id of game_ids)
            for (const game_info of details) {
                formatted = formatGameInfo(game_info, links, ranks)
                console.log(formatted) 
            }

        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    })
    .exitOverride();

program.parse(process.argv);
