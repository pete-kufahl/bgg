const { program } = require('commander');
const { fetchGamesPlayed, fetchGameDetails, formatGameInfo } = require('./utils');

program
    .version('1.0.0')
    .description('A CLI tool for calling a remote URL with a username and reading the XML response')

program
    .command('all')
    .description('Fetch data for all records')
    .requiredOption('-u, --username <username>', 'The username to include in the URL')
    .option('-s, --startdate <date>', 'Start date (yyyy-MM-dd) for data fetching. Default: Seven days ago.')
    .option('-e, --enddate <date>', 'End date (yyyy-MM-dd) for data fetching. Default: Now.')
    .option('-l, --links', 'output game names as BGG links')
    .option('-r, --ranks', 'include BGG ranks in output')
    .option('-d, --debug', 'output extra debugging')
    .action(async (options) => {
        try {
            const { username, startdate, enddate, links, ranks, debug } = options;
            const plays_per_game = await fetchGamesPlayed(username, startdate, enddate);
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
    
program
    .command('new')
    .description('Reports the new-to-you games of the time period')
    .requiredOption('-u, --username <username>', 'The username to include in the URL')
    .option('-s, --startdate <date>', 'Start date (yyyy-MM-dd) for data fetching. Default: Seven days ago.')
    .option('-e, --enddate <date>', 'End date (yyyy-MM-dd) for data fetching. Default: Now.')
    .option('-l, --links', 'output game names as BGG links')
    .option('-r, --ranks', 'include BGG ranks in output')
    .option('-c, --comments', 'include comments from the user collection data')
    .option('-i, --image_placeholders', 'include placeholder lines for BGG images')
    .option('-d, --debug', 'output extra debugging')
    .action(async (options) => {
        try {
            const { username, startdate, enddate, links, ranks, comments, image_placeholders, debug } = options;
            const plays_per_game = await fetchGamesPlayed(username, startdate, enddate);
            const details = await fetchGameDetails(username, plays_per_game);
            const new_to_me = details.filter(obj => obj.play_count === parseInt(obj.numplays, 10));

            for (const game_info of new_to_me) {
                formatted = formatGameInfo(game_info, links, ranks)
                console.log(formatted)

                if (image_placeholders) {
                    console.log(`\n[imageID=PLACEHOLDER medium][size=7]image by CREDIT[/size]\n`);
                }   
                if (comments) {
                    console.log(game_info.comment);
                    console.log();
                }
            }
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    })

program.parse(process.argv);
