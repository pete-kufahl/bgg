const { program } = require('commander');
const { fetchGamesPlayed, fetchGameDetails } = require('./utils');

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

            const details = await fetchGameDetails(username, plays_per_game);
            console.log(details)

        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program.parse(process.argv);
