const { program } = require('commander');
const { fetchGamesPlayed } = require('./allCommand');

program
    .version('1.0.0')
    .description('A CLI tool for calling a remote URL with a username and reading the XML response')

program
    .command('all')
    .description('Fetch data for all records')
    .requiredOption('-u, --username <username>', 'The username to include in the URL')
    .option('-s, --startdate <date>', 'Start date for data fetching. Default: Seven days ago.')
    .option('-e, --enddate <date>', 'End date for data fetching. Default: Now.')
    .action(async (options) => {
        try {
            const { username, startdate, enddate } = options;
            const plays_per_game = await fetchGamesPlayed(username, startdate, enddate);

            // Look up the game rank and name for each ID
            const game_ids = Object.keys(plays_per_game).map(Number);
            const game_ids_str = game_ids.join(',');

            // Print the number of plays per game
            for (const game_id of game_ids) {
                const play_count = plays_per_game[game_id];
                console.log(`Game ID: ${game_id}, Plays: ${play_count}`);
            }
            console.log(game_ids_str)
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program.parse(process.argv);
